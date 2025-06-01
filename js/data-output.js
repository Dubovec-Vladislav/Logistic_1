function dataOutput(cars, points, workTime, percent) {
  // Получаем элемент, в который будем вставлять данные
  const outputElement = document.querySelector('.main__block');

  // Создаем HTML-строку на основе данных
  let distance = 0;
  let htmlString = '<div class="main__body">';
  htmlString += '<ul class="cars__list">';
  cars.forEach((item) => {
    distance += item.Пробег;
    htmlString += '<li class="cars__list-item item">';
    htmlString += `<div class="cars__list-title title">${item['Название']}</div>`;
    htmlString += `<div class="cars__list-point point"><span>Время работы на маршруте:</span> ${(workTime - item['ОставшеесяВремяРаботы']).toFixed(2)} час(-а)</div>`;
    htmlString += `<div class="cars__list-point point"><span>Пробег:</span> ${item['Пробег']} км</div>`;

    const routeString = Object.entries(item['Маршрут'])
      .map(([point, distance]) => `<li class="cars__list-route-item">${point} - ${distance} поездок(-ки)</li>`)
      .join('');
    htmlString += `<div class="cars__list-point point"><span>Маршрут:</span> <ul class="cars__list-route">${routeString}</ul></div>`;
  });
  htmlString += '</ul>';

  htmlString += '<ul class="points__list">';
  points.forEach((point) => {
    htmlString += '<li class="points__list-item item">';
    htmlString += `<div class="points__list-title title">${point['Название']}</div>`;
    htmlString += `<div class="points__list-point point"><span>Оставшееся количество поездок:</span> ${point.КоличествоЕздок}</div>`;
    htmlString += `<div class="points__list-point point"><span>Количество доставленного груза:</span> ${Math.round(point.Потребность - point.ОставшаясяПотребность)}/${
      point.Потребность
    }</div>`;
  });
  htmlString += '</ul>';
  htmlString += '</div>';

  htmlString += `<div class="total__inf">Общий пробег: ${distance} км</div>`;
  htmlString += `<div class="total__inf">Процент доставленных грузов от общего числа: ${percent.toFixed(2)}%</div>`;

  // Вставляем HTML в элемент
  outputElement.innerHTML = htmlString;
}
