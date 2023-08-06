import exmano, { Router } from 'exmano';

const app = exmano();

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

app.get('/', (request, response) => {
  response.send('Hello World');
});

app.ws(
  '/test/:id',
  (ws, req, next) => {
    ws.send('test');
    next();
  },
  (ws, req, next) => {
    ws.send('test');
    next();
  },
  (ws, req, next) => {
    ws.on('message', (message) => {
      console.log(message.toString());
    });

    ws.send('test2');
  },
);

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
