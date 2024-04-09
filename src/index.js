import fastify from 'fastify';

const app = fastify();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', (req, res) => {
    res.send('GET /users');
  });
  
app.post('/users', (req, res) => {
res.send('POST /users');
});

export const data = {
  phones: ['+12345678', '3434343434', '234-56-78'],
  domains: ['example.com', 'hexlet.io'],
};

app.get('/phones', (req, res) => {
  res.send(data.phones);
});

app.get('/domains', (req, res) => {
  res.send(data.domains);
});

app.get('/hello', (req, res)=> {
  let greet;
  if (req.query.name) {
    greet = `Hello, ${req.query.name}!`;
  } else {
    greet = `Hello, World`;
  }  
  res.send(greet);
});

app.get('/courses/new', (req, res) => {
  res.send('Course build');
});

app.get('/courses/:id', (req, res) => {
  res.send(`Course ID: ${req.params.id}`);
});

app.get('/users/new', (req, res) => {
  res.send('User created');
});

app.get('/users/:userId', (req, res) => {
  res.send(`User ID: ${req.params.userId}`);
});

app.get('/courses/:courseId/lessons/:lessonId', (req, res) => {
  res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.lessonId}`);
});

app.get('/users/:userId/post/:postId', (req, res) => {
  res.send(`User ID: ${req.params.userId}; Post ID: ${req.params.postId}`);
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
