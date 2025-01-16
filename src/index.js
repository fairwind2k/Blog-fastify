import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import pug from 'pug';
import fastifyCookie from '@fastify/cookie';
// import fastifyCookie from 'fastify-cookie';
import session from '@fastify/secure-session';
// import session from 'fastify-session';
import flash from '@fastify/flash';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
// import fastifyMethodOverride from 'fastify-method-override';
import wrapFastify from 'fastify-method-override-wrapper';
import getCompanies from './utils/fakeCompanies.js';
import addRoutes from './routes/index.js';

export default async () => {
  const wrappedFastify = wrapFastify(fastify);
  const app = wrappedFastify({
    // any fastify options, for example logger
    exposeHeadRoutes: false,
  });
  const route = (name, placeholdersValues) => app.reverse(name, placeholdersValues);

  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route,
    },
  });

  await app.register(formbody);
  await app.register(fastifyReverseRoutes);
  // await app.register(fastifyMethodOverride);
  await app.register(wrapFastify);
  await app.register(fastifyCookie);
  await app.register(session, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: false },
  });
  await app.register(flash);

  const companies = getCompanies();
 
  const data = {
    domains: ['example.com', 'hexlet.io'],
  };

  // app.get('/cookies', (req, res) => {
  //   console.log(req.cookies);  
  //   res.send();
  // });
  
  app.get('/', (req, res) => {
    const visited = req.cookies.visited;
    const templateData = {
      visited,
    };
    res.cookie('visited', true);  
    res.view('src/views/index', templateData);
  });

  // app.get('/increment', (req, res) => {
  //   req.session.counter = req.session.counter || 0;
  //   req.session.counter += 1;
  //   res.send(`Counter incremented: ${req.session.counter}`);
  // });
  

  // app.get('/', (req, res) => res.view('src/views/index'));
  
  app.get('/hello', (req, res)=> {
    let greet;
    if (req.query.name) {
      greet = `Hello, ${req.query.name}!`;
    } else {
      greet = `Hello, World`;
    }  
    res.send(greet);
  });

  app.get('/phones', (req, res) => {
    res.send(data.phones);
  });

  app.get('/domains', (req, res) => {
    res.send(data.domains);
  });
  
   // addRoutes(app, db);
  addRoutes(app);
  return app;
};

