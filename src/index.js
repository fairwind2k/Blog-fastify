import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import pug from 'pug';
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
  await app.register(fastifyMethodOverride, {
    methods: ['PATCH', 'DELETE']  
  });

  const companies = getCompanies();
  // const courses = getCourses();

  
   const data = {
    phones: ['+12345678', '3434343434', '234-56-78'],
    domains: ['example.com', 'hexlet.io'],
  };

  app.get('/', (req, res) => res.view('src/views/index'));

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
  
  // app.register(fastifyMethodOverride);
   // addRoutes(app, db);
  addRoutes(app);
  return app;
};

