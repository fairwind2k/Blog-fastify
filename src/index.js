import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';
import sanitize from 'sanitize-html';
import getUsers from './fakeUsers.js';
import getCompanies from './fakeCompanies.js';

const app = fastify();
const port = 3000;
const data = {
  phones: ['+12345678', '3434343434', '234-56-78'],
  domains: ['example.com', 'hexlet.io'],
};

const users = getUsers();
const companies = getCompanies();

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

app.get('/users', (req, res) => res.view('src/views/users/index', { users }));
  
app.post('/users', (req, res) => {
res.send('POST /users');
});

app.get('/users/new', (req, res) => {
  res.send('User created');
});

// app.get('/users/:userId', (req, res) => {
//   res.send(`User ID: ${req.params.userId}`);
// });

app.get('/users/:userId', (req, res) => {
  const escapedId = sanitize(req.params.userId);
  res.type('html');
  res.send(`<h1>${escapedId}</h1>`);
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



// app.get('/courses/new', (req, res) => {
//   res.send('Course build');
// });

// app.get('/courses/:id', (req, res) => {
//   const { id } = req.query;
//   const course = courses.find((item) => item.id.toString() === id);
//   if (!course) {
//     res.code(404).send({ message: 'Course not found' });
//     return;
//   }
//   const data = {
//     course,
//   };
//   res.view('src/views/courses/show', data);
// });


// app.get('/courses/:courseId/lessons/:lessonId', (req, res) => {
//   res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.lessonId}`);
// });


app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
