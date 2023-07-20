import exmano, { Router } from 'exmano';

const app = exmano();

const router = new Router('/1');
const router2 = new Router('/3');
const router3 = new Router('/3');

router2.post('/4', (request, response) => {});
router3.post('/', (request, response) => {});
router.use('/2/', router2);
router.use('/2', router3);

app.get('/1/2/3/4', (request, response) => {});
app.use(router);

app.get('/', (request, response) => {
  response.send('Hello World');
});

console.log(app.routers);

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
