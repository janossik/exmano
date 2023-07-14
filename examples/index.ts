import exmano, { parseBodyToJson, Router } from 'exmano';

const app = exmano();

console.log(app.errorHandler);

app.use(parseBodyToJson);

app.get('/zzz/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

const router = new Router('/test');

const router2 = new Router('/test2');

router2.post('/:id', (req, res) => {
  res.json({ message: 'Hello World! 2', body: req.body });
});

router.use(router2);
app.use(router);

console.log(app);

app.listen(3000, '0.0.0.0', () => {
  console.log('Example app listening on port 3000!');
});
