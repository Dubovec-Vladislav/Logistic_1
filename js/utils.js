// Функция для создания полей ввода для точек
function createPointInputs() {
  const pointCount = document.getElementById('pointCount').value;

  let inputsHtml = '';

  for (let i = 0; i < pointCount; i++) {
    inputsHtml += `
    <div class="main__form-row">
      <div class="main__form-field">
        <div class="main__form-label">Точка ${i + 1}</div>
        <div class="main__form-field-inputs">
          <input class="main__form-field-input" type="number" id="depotDistance${i}" min="1" placeholder="Расстояние от депо">
          <input class="main__form-field-input" type="number" id="careerDistance${i}" min="1" placeholder="Расстояние от карьера">
          <input class="main__form-field-input" type="number" id="needs${i}" min="1" placeholder="Потребность в тоннах груза">
        </div>
      </div>
    </div>
    `;
  }

  document.getElementById('pointInputs').innerHTML = inputsHtml;

  // const depotToCareerDistance = 6; // Расстояние от депо до карьера
  // const depotToPointsDistances = [10, 8, 13]; // Расстояния от депо до каждой точки
  // const careerToPointsDistances = [18, 12, 7]; // Расстояния от карьера до каждой точки
  // const needs = [30, 40, 50]; // Потребности для каждой точки
}

// Функция для получения отсортированного списка очередности объезда
function getSortedQueueList(pointsInfo) {
  return Object.fromEntries(
    pointsInfo
      .map((point, index) => ({ key: `Point${index + 1}`, value: point.depotTo - point.careerTo }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => [entry.key, index + 1])
  );
}

// Функция для смены первого и последнего пункта маршрута местами
function swapFirstRouteKeyValue(cars) {
  cars.forEach((car) => {
    if (Object.keys(car.Маршрут).length !== 0) {
      const route = car.Маршрут;
      const keys = Object.keys(route);
      const values = Object.values(route);

      // Меняем местами первый и последний ключ
      [keys[0], keys[keys.length - 1]] = [keys[keys.length - 1], keys[0]];
      // Меняем местами первое и последнее значение
      [values[0], values[values.length - 1]] = [values[values.length - 1], values[0]];

      // Обновляем поле "Маршрут" в объекте
      car.Маршрут = keys.reduce((acc, key, index) => {
        acc[key] = values[index];
        return acc;
      }, {});
    } // Проверяем есть ли что-то в маршруте
  });
}

// ---- Планирование последних поездок и возвращения в депо ---- //

// Функция для расчета времени и пробега до последней точки
function calculateTimeAndMileageToLastPoint(lastPoint, transport, numberOfTrips) {
  let time = 0;
  let mileage = 0;
  const route = {};

  for (let i = 0; i < numberOfTrips; i++) {
    const isLastTrip = i === numberOfTrips - 1;
    const distanceToCareer = lastPoint.РасстояниеОтКарьераДоЭтойТочки;
    const distanceToDepot = lastPoint.РасстояниеОтДепоДоЭтойТочки;

    time += isLastTrip
      ? (distanceToCareer + distanceToDepot) / transport.speed + transport.loadingAndUnloadingTime
      : (distanceToCareer * 2) / transport.speed + transport.loadingAndUnloadingTime;
    mileage += isLastTrip ? distanceToCareer + distanceToDepot : distanceToCareer * 2;

    route[lastPoint.Название] = i + 1;
  }

  return { time, mileage, route };
}

// Функция для обновления данных по каждому автомобилю
function updateCarData(cars, lastPoint, time, mileage, route) {
  for (let i = 0; i < lastPoint.КоличествоЕздок; i++) {
    if (i > cars.length - 1) break;
    cars[i].ОставшеесяВремяРаботы -= time;
    cars[i].Пробег += mileage;
    cars[i].Маршрут = { ...route };
  }
}

// Функция для обновления данных по последней точке
function updateLastPointData(lastPoint, numberOfTrips, carsLength, actualLiftingCapacity) {
  lastPoint.КоличествоЕздок = Math.max(0, lastPoint.КоличествоЕздок - numberOfTrips * carsLength);
  lastPoint.ОставшаясяПотребность = Math.max(0, lastPoint.ОставшаясяПотребность - numberOfTrips * carsLength * actualLiftingCapacity);
}

// Главная функция для планирование последних поездок и возвращения в депо
function planLastTripsAndReturn(cars, points, transport, actualLiftingCapacity, numberOfCars) {
  const lastPoint = points[points.length - 1];
  const numberOfTripsToLastPoint = numberOfCars === points.length ? Math.floor(lastPoint.КоличествоЕздок / cars.length) || 1 : 1;

  const { time, mileage, route } = calculateTimeAndMileageToLastPoint(lastPoint, transport, numberOfTripsToLastPoint);
  updateCarData(cars, lastPoint, time, mileage, route);
  updateLastPointData(lastPoint, numberOfTripsToLastPoint, cars.length, actualLiftingCapacity);
}
// ------------------------------------------------------------- //

// ------- Планирование других маршрутов для автомобилей ------- //
function planOtherRoutes(cars, points, transport, actualLiftingCapacity) {
  for (const point of points) {
    for (const car of cars) {
      let tripCounter = car.Маршрут[point.Название] ? car.Маршрут[point.Название] : 0; // Если у нас уже были ездки на этой машине в этот пункт,
      //  то счетчик начинается с их количества (а не с 0)
      while (point.КоличествоЕздок > 0 && car.ОставшеесяВремяРаботы > 0) {
        tripCounter += 1;
        const mileage = point['РасстояниеОтКарьераДоЭтойТочки'] * 2;
        const time = mileage / transport.speed + transport.loadingAndUnloadingTime;

        if (car.ОставшеесяВремяРаботы - time > 0) {
          car.ОставшеесяВремяРаботы -= time;
          car.Пробег += mileage;
          car.Маршрут[point.Название] = tripCounter;
          point.КоличествоЕздок -= 1;
          point.ОставшаясяПотребность -= actualLiftingCapacity;
          if (point.ОставшаясяПотребность < 0) point.ОставшаясяПотребность = 0;
        } else break;
      }
    }
  }
}
// ------------------------------------------------------------- //

// ------------ Расчет общего % доставленных грузов ------------ //
function calculateCompletionPercentage(points, pointsInfo) {
  const fulfilledNeed = points.reduce((sum, point) => sum + point.ОставшаясяПотребность, 0);
  const totalNeed = pointsInfo.reduce((sum, point) => sum + point.need, 0);
  return 100 - (fulfilledNeed / totalNeed) * 100;
}
// ------------------------------------------------------------- //
