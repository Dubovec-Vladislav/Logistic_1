function main(depotToPointsDistances, treatmentToPointsDistances, needs, transport, numberOfCars, workTime) {
  // ---------- Информация о домах ---------- //
  const pointsInfo = Array.from({ length: depotToPointsDistances.length }, (_, index) => ({
    name: `Дом ${index + 1}`,
    depotTo: depotToPointsDistances[index],
    treatmentTo: treatmentToPointsDistances[index],
    need: needs[index],
  }));
  // ----------------------------------------- //

  // ------- 1. Определение количество вывозов для каждого дома ------ //
  const trips = pointsInfo.map((point) => Math.ceil(point.need / transport.actualLiftingCapacity));
  // ---------------------------------------------------------------- //

  // ------------- 2. Определение очередности объезда --------------- //
  const queueList = getSortedQueueList(pointsInfo);

  // Формирование информации о домах
  const points = pointsInfo.map((point, index) => ({
    Название: point.name,
    РасстояниеОтДепоДоЭтойТочки: point.depotTo,
    РасстояниеОтОчистногоСооружения: point.treatmentTo,
    КоличествоЕздок: trips[index],
    ОчередностьОбъезда: queueList[`Дом ${index + 1}`],
    Потребность: needs[index],
    ОставшаясяПотребность: point.need,
  }));

  // Сортировка домов по порядку объезда
  points.sort((a, b) => a['ОчередностьОбъезда'] - b['ОчередностьОбъезда']);
  // --------------------------------------------------------------- //

  // --- 3. Планирование последних вывозов и возвращения в депо ---- //

  // Информация об ассенизаторских машинах
  const cars = Array.from({ length: numberOfCars }, (_, index) => ({
    'Название': `Ассенизаторная машина ${index + 1}`,
    'ОставшеесяВремяРаботы': workTime,
    'Пробег': 0,
    'Маршрут': {},
  }));

  // Планирование последних вывозов и возвращения в депо
  planLastTripsAndReturn(cars, points, transport, transport.actualLiftingCapacity, numberOfCars);
  
  // Планирование других маршрутов для машин
  planOtherRoutes(cars, points, transport, transport.actualLiftingCapacity);
  
  // Смена мест первого и последнего пункта в маршруте
  swapFirstRouteKeyValue(cars);
  
  // Расчет процента вывезенных отходов
  const percent = calculateCompletionPercentage(points, pointsInfo);
  
  // Вывод данных
  dataOutput(cars, points, workTime, percent);
  // -------------------------------------------------------------- //
}