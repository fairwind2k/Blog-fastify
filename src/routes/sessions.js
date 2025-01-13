import encrypt from './encrypt.js';

  // add a login route that returns a login page
  instance.get('/login', (request, reply) => {
    reply.type('text/html')
    reply.send(loginPage())
  })
  
  // add a login route that handles the actual login
  instance.post('/login', (request, reply) => {
    const { email, password } = request.body
  
    if (password === 'abcdef') {
      request.session.authenticated = true
      reply.type('text/html')
      reply.send(defaultPage(true))
    } else {
      reply.redirect(401, '/login')
    }
  });