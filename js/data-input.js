function calculateData() {
  const pointCount = document.getElementById('pointCount').value;
  const numberOfCars = parseInt(document.getElementById('carCount').value);
  const workTime = parseInt(document.getElementById('workTime').value);
  console.log('WorkTime input:', workTime); // Добавьте лог для проверки
  const depotToPointsDistances = [];
  const treatmentToPointsDistances = []; // Бывший careerToPointsDistances
  const needs = [];

  for (let i = 0; i < pointCount; i++) {
    const depotDistance = parseFloat(document.getElementById(`depotDistance${i}`).value);
    const treatmentDistance = parseFloat(document.getElementById(`treatmentDistance${i}`).value);
    const pointNeeds = parseFloat(document.getElementById(`needs${i}`).value);
    depotToPointsDistances.push(depotDistance);
    treatmentToPointsDistances.push(treatmentDistance);
    needs.push(pointNeeds);
  }

  const transport = {
    speed: parseFloat(document.getElementById('speed').value),
    liftingCapacity: parseFloat(document.getElementById('liftingCapacity').value),
    capacityUtilizationFactor: parseFloat(document.getElementById('capacityUtilizationFactor').value),
    loadingAndUnloadingTime: parseFloat(document.getElementById('loadingAndUnloadingTime').value),
  };
  transport["actualLiftingCapacity"] = transport.liftingCapacity * transport.capacityUtilizationFactor;

  main(depotToPointsDistances, treatmentToPointsDistances, needs, transport, numberOfCars, workTime);
}