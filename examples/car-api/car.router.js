const { Router, HttpError } = require('exmano');
const fs = require('node:fs');

const carRouter = new Router('cars'); // You can add "cars" to the path using "use" from the app

const getCars = async (name) => {
  const cars = JSON.parse(await fs.promises.readFile('cars.json', { encoding: 'utf-8' }));

  if (typeof name === 'string' && Array.isArray(cars)) {
    return cars.find((car) => {
      if ('name' in car && car.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())) {
        return car;
      }
    });
  }

  return cars;
};

carRouter.get('/', async (req, res) => {
  const cars = await getCars();
  res.json(cars);
});

carRouter.get('/:name', async (req, res) => {
  const car = await getCars(req.params.name);
  if (!car) {
    throw new HttpError('Not found', 404);
  }
  res.json(car);
});

module.exports = carRouter;
