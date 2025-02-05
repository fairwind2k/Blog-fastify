import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import pug from 'pug';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/secure-session';
import flash from '@fastify/flash';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import wrapFastify from 'fastify-method-override-wrapper';
import sqlite3 from 'sqlite3';
import getCompanies from './utils/fakeCompanies.js';
import addRoutes from './routes/index.js';

export default async () => {
  const wrappedFastify = wrapFastify(fastify);
  const app = wrappedFastify({
    logger: false,
    exposeHeadRoutes: false,
  });
  const route = (name, placeholdersValues) => app.reverse(name, placeholdersValues);
  const db = new sqlite3.Database(':memory:');

  const prepareDatabase = () => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE courses (
          id INT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT
        );
      `);
    });

    const courses = [
      { id: 1, title: 'JavaScript', description: 'Курс по языку программирования JavaScript' },
      { id: 2, title: 'Fastify', description: 'Курс по фреймворку Fastify' },
    ];

    const stmt = db.prepare('INSERT INTO courses VALUES (?, ?, ?)');
  
    courses.forEach((course) => {
      stmt.run(course.id, course.title, course.description);
    });
  
    stmt.finalize();
  };

  prepareDatabase();

  const companies = getCompanies(); 
  const data = {
    domains: ['example.com', 'hexlet.io'],
  };

  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route,
    },
  });
  await app.register(formbody);
  await app.register(fastifyReverseRoutes);
  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    cookie: {
      // Настройки куки, например:
      secure: false, // Установите true, если используете HTTPS
    },
    secret: 'a secret with minimum length of 32 characters',
  });
  await app.register(flash);

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
  
  addRoutes(app, db);
  return app;
};

