import { Appltication } from './Application';
import { parseCookies } from './middlewares/parse-cookies';
import { parseBodyToJson } from './middlewares/parse-body-to-json';

const app = new Appltication();
app.use(parseCookies);
app.use(parseBodyToJson);

app.post(
  '/post',
  (request, response, next) => {
    next();
  },
  async (request, response, next) => {
    await next(new Error('error xd'));
    console.log(request.body);
    //response.json({ message: 'post' });
  },
);

app.use((request, response, next) => {
  console.log(request.cookies, '!!!');
  next();
});

/*
app.post(
  '/post/:id',
  (request, response, next) => {
    response.json({ message: 'post' });
  },
  (request, response) => {
    response.json({ message: 'postz' });
  },
);
*/

app.listen(3000, '0.0.0.0', () => {
  console.log('server work');
});
