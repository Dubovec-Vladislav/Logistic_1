// Функция для создания полей ввода для домов
function createPointInputs() {
  const pointCount = document.getElementById('pointCount').value;

  let inputsHtml = '';

  for (let i = 0; i < pointCount; i++) {
    inputsHtml += 
    `<div class="main__form-row">
      <div class="main__form-field">
        <div class="main__form-label">Дом ${i + 1}</div>
        <div class="main__form-field-inputs">
          <input class="main__form-field-input" type="number" id="depotDistance${i}" min="1" placeholder="Расстояние до депо">
          <input class="main__form-field-input" type="number" id="treatmentDistance${i}" min="1" placeholder="Расстояние до очистного сооружения">
          <input class="main__form-field-input" type="number" id="needs${i}" min="1" placeholder="Объем отходов (м³)">
        </div>
      </div>
    </div>`;
  }

  document.getElementById('pointInputs').innerHTML = inputsHtml;
}

// Функция для получения отсортированного списка очередности объезда
function getSortedQueueList(pointsInfo) {
  return Object.fromEntries(
    pointsInfo
      .map((point, index) => ({ 
        key: `Дом ${index + 1}`, 
        value: point.depotTo - point.treatmentTo 
      }))
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

      [keys[0], keys[keys.length - 1]] = [keys[keys.length - 1], keys[0]];
      [values[0], values[values.length - 1]] = [values[values.length - 1], values[0]];

      car.Маршрут = keys.reduce((acc, key, index) => {
        acc[key] = values[index];
        return acc;
      }, {});
    }
  });
}

// Функция для расчета времени и пробега до последнего дома
function calculateTimeAndMileageToLastPoint(lastPoint, transport, maxTrips, availableTime) {
  let time = 0;
  let mileage = 0;
  let actualTrips = 0;
  const route = {};

  for (let i = 0; i < maxTrips; i++) {
    const isLastTrip = i === maxTrips - 1;
    const distanceToTreatment = lastPoint.РасстояниеОтОчистногоСооружения;
    const distanceToDepot = lastPoint.РасстояниеОтДепоДоЭтойТочки;
    
    const tripTime = isLastTrip
      ? (distanceToTreatment + distanceToDepot) / transport.speed + transport.loadingAndUnloadingTime
      : (distanceToTreatment * 2) / transport.speed + transport.loadingAndUnloadingTime;
    
    // Проверяем, хватит ли времени на эту поездку
    if (time + tripTime > availableTime) break;
    
    time += tripTime;
    mileage += isLastTrip ? distanceToTreatment + distanceToDepot : distanceToTreatment * 2;
    route[lastPoint.Название] = i + 1;
    actualTrips++;
  }

  return { time, mileage, route, actualTrips };
}

// Функция для обновления данных по каждой машине
function updateCarData(cars, lastPoint, time, mileage, route) {
  for (let i = 0; i < lastPoint.КоличествоЕздок; i++) {
    if (i > cars.length - 1) break;
    cars[i].ОставшеесяВремяРаботы -= time;
    cars[i].Пробег += mileage;
    cars[i].Маршрут = { ...route };
  }
}

// Функция для обновления данных по последнему дому
function updateLastPointData(lastPoint, numberOfTrips, carsLength, actualLiftingCapacity) {
  lastPoint.КоличествоЕздок = Math.max(0, lastPoint.КоличествоЕздок - numberOfTrips * carsLength);
  lastPoint.ОставшаясяПотребность = Math.max(
    0, 
    lastPoint.ОставшаясяПотребность - numberOfTrips * carsLength * actualLiftingCapacity
  );
}

// Главная функция для планирования последних вывозов и возвращения в депо
function planLastTripsAndReturn(cars, points, transport, actualLiftingCapacity, numberOfCars) {
  const lastPoint = points[points.length - 1];
  const maxPossibleTrips = numberOfCars === points.length 
    ? Math.floor(lastPoint.КоличествоЕздок / cars.length) || 1 
    : 1;

  // Для каждой машины рассчитываем поездки индивидуально с учетом ее оставшегося времени
  cars.forEach(car => {
    const { time, mileage, route, actualTrips } = calculateTimeAndMileageToLastPoint(
      lastPoint, 
      transport, 
      maxPossibleTrips,
      car.ОставшеесяВремяРаботы
    );
    
    if (actualTrips > 0) {
      car.ОставшеесяВремяРаботы -= time;
      car.Пробег += mileage;
      car.Маршрут = { ...route };
      lastPoint.КоличествоЕздок -= actualTrips;
      lastPoint.ОставшаясяПотребность -= actualTrips * actualLiftingCapacity;
      
      if (lastPoint.ОставшаясяПотребность < 0) {
        lastPoint.ОставшаясяПотребность = 0;
      }
    }
  });
}

// Функция для планирования других маршрутов для машин
function planOtherRoutes(cars, points, transport, actualLiftingCapacity) {
  for (const point of points) {
    for (const car of cars) {
      let tripCounter = car.Маршрут[point.Название] || 0;
      
      while (point.КоличествоЕздок > 0 && car.ОставшеесяВремяРаботы > 0) {
        tripCounter += 1;
        const mileage = point.РасстояниеОтОчистногоСооружения * 2;
        const time = mileage / transport.speed + transport.loadingAndUnloadingTime;

        if (car.ОставшеесяВремяРаботы - time > 0) {
          car.ОставшеесяВремяРаботы -= time;
          car.Пробег += mileage;
          car.Маршрут[point.Название] = tripCounter;
          point.КоличествоЕздок -= 1;
          point.ОставшаясяПотребность -= actualLiftingCapacity;
          
          if (point.ОставшаясяПотребность < 0) {
            point.ОставшаясяПотребность = 0;
          }
        } else {
          break;
        }
      }
    }
  }
}

// Функция для расчета процента вывезенных отходов
function calculateCompletionPercentage(points, pointsInfo) {
  const fulfilledNeed = points.reduce((sum, point) => sum + point.ОставшаясяПотребность, 0);
  const totalNeed = pointsInfo.reduce((sum, point) => sum + point.need, 0);
  return 100 - (fulfilledNeed / totalNeed) * 100;
}