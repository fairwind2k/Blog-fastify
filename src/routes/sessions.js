// import encrypt from './encrypt.js';

const users = [
  {
    id: 1,
    username: 'first user',
    email: 'first@user.com',
    password: 'user1'
  },
  {
    id: 2,
    username: 'second user',
    email: 'second@user.com',
    password: 'user2'
  },
];

export default (app, db) => {

  app.get('/login', (req, res) => {
    const { username } = req.session;
    res.view('src/views/sessions/login', { username });
  });

  app.get('/sessions/new', (req, res) => {
    res.view('src/views/sessions/new');
  });

  app.post('/sessions', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(elem => elem.username === username);

    // if (!user || (decrypt(user.password) !== password)) {
    //   res.view('src/views/sessions/new', { error: 'Неверное имя пользователя или пароль'});
    //   return;
    // }
    if ( !user || user.password !== password) {
      res.view('src/views/sessions/new', { message: 'Неверное имя пользователя или пароль'});
      return;
    };
    req.session.username = username;
    res.redirect('/login');
  });

  // app.post('/sessions/delete', (req, res) => {
  //   req.session.destroy( (err) => {
  //     if (err) {
  //       res.status(500);
  //       res.send('Internal Server Error');
  //     } else {
  //       res.redirect('/login');
  //     }
  //   });
  // });

  app.post('/sessions/delete', (req, res) => {
    req.session.delete();
    // req.session = null;
    return res.redirect('/login');
  });
  
};
