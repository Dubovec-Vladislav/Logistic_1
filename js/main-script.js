function main(depotToPointsDistances, careerToPointsDistances, needs, transport, numberOfCars, workTime) {
  // ---------- Информация о точках ---------- //
  const pointsInfo = Array.from({ length: depotToPointsDistances.length }, (_, index) => ({
    name: `Пункт ${index + 1}`,
    depotTo: depotToPointsDistances[index],
    careerTo: careerToPointsDistances[index],
    need: needs[index],
  }));
  // ----------------------------------------- //

  // ------- 1. Определение количество ездок в каждую точку ------ //
  const trips = pointsInfo.map((point) => Math.ceil(point.need / transport.actualLiftingCapacity));
  // ------------------------------------------------------------- //

  // ------------- 2. Определение очередности объезда ------------ //
  const queueList = getSortedQueueList(pointsInfo); // -> { Point3: 1, Point2: 2, Point1: 3 }

  // Формирование информации о точках
  const points = pointsInfo.map((point, index) => ({
    Название: point.name,
    РасстояниеОтДепоДоЭтойТочки: point.depotTo,
    РасстояниеОтКарьераДоЭтойТочки: point.careerTo,
    КоличествоЕздок: trips[index],
    ОчередностьОбъезда: queueList[`Point${index + 1}`],
    Потребность: needs[index],
    ОставшаясяПотребность: point.need,
  }));

  // Сортировка точек по порядку объезда
  points.sort((a, b) => a['ОчередностьОбъезда'] - b['ОчередностьОбъезда']); // 1 -> 2 -> 3 -> ...
  // ------------------------------------------------------------- //

  // --- 3. Планирование последних поездок и возвращения в депо -- //

  // Информация о машинах
  const cars = Array.from({ length: numberOfCars }, (_, index) => ({
    'Название': `Машина ${index + 1}`,
    'ОставшеесяВремяРаботы': workTime,
    'Пробег': 0,
    'Маршрут': {},
  }));

  // Планирование последних поездок и возвращения в депо
  planLastTripsAndReturn(cars, points, transport, transport.actualLiftingCapacity, numberOfCars);
  // Планирование других маршрутов для автомобилей
  planOtherRoutes(cars, points, transport, transport.actualLiftingCapacity);
  // Смена мест первого и последнего пункта в маршруте (потому что алгоритм начинают работу с определения последнего пункта маршрута)
  swapFirstRouteKeyValue(cars);
  // Расчет процента выполннения заказов
  const percent = calculateCompletionPercentage(points, pointsInfo);
  // Вывод данных
  dataOutput(cars, points, workTime, percent);
  // ------------------------------------------------------------- //
}
