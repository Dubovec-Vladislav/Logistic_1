function dataOutput(cars, points, workTime, percent) {
  const outputElement = document.querySelector('.main__block');
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
      .map(([point, trips]) => `<li class="cars__list-route-item">${point} - ${trips} вывозов</li>`)
      .join('');
    htmlString += `<div class="cars__list-point point"><span>Маршрут:</span> <ul class="cars__list-route">${routeString}</ul></div>`;
    htmlString += '</li>';
  });
  htmlString += '</ul>';

  htmlString += '<ul class="points__list">';
  points.forEach((point) => {
    htmlString += '<li class="points__list-item item">';
    htmlString += `<div class="points__list-title title">${point['Название']}</div>`;
    htmlString += `<div class="points__list-point point"><span>Оставшееся количество вывозов:</span> ${point.КоличествоЕздок}</div>`;
    htmlString += `<div class="points__list-point point"><span>Объем вывезенных отходов:</span> ${Math.round(point.Потребность - point.ОставшаясяПотребность)}/${point.Потребность} м³</div>`;
    htmlString += '</li>';
  });
  htmlString += '</ul>';
  htmlString += '</div>';

  htmlString += `<div class="total__inf">Общий пробег: ${distance} км</div>`;
  htmlString += `<div class="total__inf">Процент вывезенных отходов: ${percent.toFixed(2)}%</div>`;

  outputElement.innerHTML = htmlString;
}
