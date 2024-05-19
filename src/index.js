import fastify from 'fastify';
import formbody from '@fastify/formbody';
import view from '@fastify/view';
import yup from 'yup';
import pug from 'pug';
import sanitize from 'sanitize-html';
import getUsers from './fakeUsers.js';
import getCompanies from './fakeCompanies.js';
import getCourses from './fakeCourses.js';
import { generateId } from './fakeUsers.js';


export default async () => {
  const app = fastify();

  await app.register(view, { engine: { pug } });
  await app.register(formbody);
  
  const users = getUsers();
  const companies = getCompanies();
  // const courses = getCourses();


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

  // app.get('/users', (req, res) => {
  //   const term = req.query.term;
  //   let filtered;
  //   if (term !== '' && term !== null) {
  //     filtered = users.filter((user) => user.username.toLowerCase().includes(term));
  //     console.log('1');
  //   } else {
  //     console.log('2');
  //     res.view('src/views/users/index', { term, users: users });
  //   }
  //   const data = { term, users: filtered };
  //   res.view('src/views/users/index', data);
  // });
    
  const states = {
    users: [
      {
        id: 1,
        name: 'user',
        email: 'user@user.com',
        password: '123'
      },
    ],
  };  

  app.get('/users', (req, res) => res.send(states));

  // app.get('/search', (req, res) => {
  //   const { id } = req.query;
  //   const user = state.users.find(user => user.id === parseInt(id)); // Приведение к одному типу и сравнение
  //   if (!user) {
  //     res.code(404).send({ message: 'User not found' })
  //   } else {
  //     res.send(user);
  //   }
  // });

  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2),
        email: yup.string().email(),
        password: yup.string().min(5),
        passwordConfirmation: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation is not equal the password'),
        };
      }
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  } , (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body;

    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      passwordConfirmation: passwordConfirmation,
    };
    if (req.validationError) {
      const data = { 
        ...userData,
        error: req.validationError,
      };  
      res.view('src/views/users/new', data);
      return;
    };    
    const user = { 
      id:generateId(),
      name: userData.name,
      email: userData.email,
      password: userData.password
    };
    states.users.push(user);
    //res.send(user);
    res.redirect('/users');
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

  const data = {
    phones: ['+12345678', '3434343434', '234-56-78'],
    domains: ['example.com', 'hexlet.io'],
  };

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
    res.view('src/views/courses/new');
  });

  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2),
        description: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  }, (req, res) => {
    const dataCourse = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
    };
    if (req.validationError) {
      const data = {
        ...dataCourse,
        error: req.validationError,
      };
      res.view('src/views/courses/new', data);
      return;
    }  
    const newCourse = { id:generateId(), ...dataCourse};
    courses.push(newCourse);
    //res.send(newCourse);
    res.redirect('/courses');
  });


  //  get all courses in one page:
  //
  // app.get('/courses', (req, res)=> {
  //   //const data = state.courses;
  //   const data = courses;
  //   res.view('src/views/courses/index', { data });
  // });

  // app.get('/courses', (req, res) => {
  //   const term = req.query.term;
  //   let selectedCourses;
  //   if (term !== '') {
  //     // Фильтруем курсы по term
  //     selectedCourses = courses.filter((item) => item.title === term);
  //   } else {
  //     // Извлекаем все курсы, которые хотим показать
  //     selectedCourses = courses.slice(0, 2);
  //   }  
  //   const data = { term, courses: selectedCourses };  
  //   res.view('src/views/courses/index', data);
  // });

  app.get('/courses', (req, res) => {
    res.send(courses);
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

