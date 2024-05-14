import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';
import sanitize from 'sanitize-html';
import getUsers from './fakeUsers.js';
import getCompanies from './fakeCompanies.js';
import getCourses from './fakeCourses.js';


export default async () => {
  const app = fastify();
  const data = {
    phones: ['+12345678', '3434343434', '234-56-78'],
    domains: ['example.com', 'hexlet.io'],
  };

  const users = getUsers();
  const companies = getCompanies();
  // const courses = getCourses();

  await app.register(view, { engine: { pug } });

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

  app.get('/users', (req, res) => {
    const term = req.query.term;
    let filtered;
    if (term !== '' && term !== null) {
      filtered = users.filter((user) => user.username.toLowerCase().includes(term));
      console.log('1');
    } else {
      console.log('2');
      res.view('src/views/users/index', { term, users: users });
    }
    const data = { term, users: filtered };
    res.view('src/views/users/index', data);
  });
    
  app.post('/users', (req, res) => {
    res.send('POST /users');
  });

  app.get('/users/new', (req, res) => {
    res.view('src/views/users/new');
  });

  // app.get('/users/:userId', (req, res) => {
  //   res.send(`User ID: ${req.params.userId}`);
  // });

  // app.get('/users/:userId', (req, res) => {
  //   const escapedId = sanitize(req.params.userId);
  //   res.type('html');
  //   res.send(`<h1>${escapedId}</h1>`);
  // });

  app.get('/users/:userId', (req, res) => {
    const escapedId = sanitize(req.params.userId);
    const user = users.find(({ id }) => id === escapedId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    return res.view('src/views/users/show', { user });
  });

  app.get('/users/:userId/post/:postId', (req, res) => {
    res.send(`User ID: ${req.params.userId}; Post ID: ${req.params.postId}`);
  });

  app.get('/phones', (req, res) => {
    res.send(data.phones);
  });

  app.get('/domains', (req, res) => {
    res.send(data.domains);
  });

  // const state = {
  //   courses: [
  //     {
  //       id: 1,
  //       title: 'JS: Массивы',
  //       description: 'Курс про массивы в JavaScript',
  //     },
  //     {
  //       id: 2,
  //       title: 'JS: Функции',
  //       description: 'Курс про функции в JavaScript',
  //     },
  //     {
  //       id: 3,
  //       title: 'JS: Объекты',
  //       description: 'Курс про объекты в JavaScript',
  //     },
  //   ],
  // };

  const courses =
   [
      {
        id: 1,
        title: 'JS: Массивы',
        description: 'Курс про массивы в JavaScript',
      },
      {
        id: 2,
        title: 'JS: Функции',
        description: 'Курс про функции в JavaScript',
      },
      {
        id: 3,
        title: 'JS: Объекты',
        description: 'Курс про объекты в JavaScript',
      },
    ];

  app.get('/courses/new', (req, res) => {
    res.send('Course build');
  });

  //  get all courses in one page:
  //
  // app.get('/courses', (req, res)=> {
  //   //const data = state.courses;
  //   const data = courses;
  //   res.view('src/views/courses/index', { data });
  // });

  app.get('/courses', (req, res) => {
    const term = req.query.term;
    let selectedCourses;
    if (term !== '') {
      // Фильтруем курсы по term
      selectedCourses = courses.filter((item) => item.title === term);
    } else {
      // Извлекаем все курсы, которые хотим показать
      selectedCourses = courses.slice(0, 2);
    }  
    const data = { term, courses: selectedCourses };  
    res.view('src/views/courses/index', data);
  });
  
  app.get('/courses/:id', (req, res) => {
    const escapedCourseId = sanitize(req.params.id);
    // const course = state.courses.find((item) => item.id.toString() === escapedCourseId);
    const course = courses.find((item) => item.id.toString() === escapedCourseId);
    if (!course) {
      return res.code(404).send({ message: 'Course not found' });    
    }
    const data = {
      course,
    };
    return res.view('src/views/courses/show', data);
  });

  app.get('/courses/:courseId/lessons/:lessonId', (req, res) => {
    res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.lessonId}`);
  });

  return app;
};

