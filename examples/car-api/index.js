const exmano = require('exmano');
const carRouter = require('./car.router');

const app = exmano();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Wlecome in car API');
});

app.use(carRouter);

app.listen(port, () => {
  console.log(`Example app listening on http://localhost${port}`);
});
