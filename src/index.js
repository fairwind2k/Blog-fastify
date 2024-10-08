import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import pug from 'pug';
// import fastifyCookie from '@fastify/cookie';
import fastifyCookie from 'fastify-cookie';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifyMethodOverride from 'fastify-method-override';

import getCompanies from './utils/fakeCompanies.js';

import addRoutes from './routes/index.js';

export default async () => {
  const app = fastify({ exposeHeadRoutes: false });
  const route = (name, placeholdersValues) => app.reverse(name, placeholdersValues);

  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route,
    },
  });
  await app.register(formbody);
  await app.register(fastifyReverseRoutes);
  await app.register(fastifyMethodOverride);
  await app.register(fastifyCookie);
  
  const companies = getCompanies();
 
  const data = {
    phones: ['+12345678', '3434343434', '234-56-78'],
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

