import exmano, { Router } from 'exmano';

const app = exmano();

app.get('/', async (request, response) => {
  //throw new Error("Nie działa");

  response.send('Hello World');
});

const router0 = new Router();

router0.get('/test', (req, res) => {
  res.json({ test: 'test' });
});

app.use(router0);

const router1 = new Router('/1');
const router2 = new Router('/3');
const router3 = new Router('/3');

router2.post('/4', (request, response) => {
  response.send('router2 POST /1/2/3/4');
});
router3.post('/', (request, response) => {
  response.send('router3 POST /1/2/3');
});

router1.use('/2', router2);
router1.use('/2', router3);

app.get('/1/2/3/4', (request, response) => {
  response.send('router1 GET /1/2/3/4');
});

app.use(router1);

app.ws(
  '/test/:id',
  function (ws, req, next) {
    ws.send('test');
    next();
  },
  (ws, req, next) => {
    ws.send('test');
    next();
  },
  (ws, _req, _next) => {
    ws.on('message', (message) => {
      console.log(message.toString());
    });

    ws.send('test2');
  },
);

app.use((req, res) => {
  res.send('Co jest?');
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
