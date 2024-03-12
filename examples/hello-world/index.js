const exmano = require('exmano');

const app = exmano();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost${port}`);
});
