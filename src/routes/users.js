import yup from 'yup';
import sanitize from 'sanitize-html';
import getUsers from '../utils/fakeUsers.js';
import { generateId } from '../utils/fakeUsers.js';

export default (app, db) => {

    //const users = getUsers();

    const users = [
      {
        id: 1,
        name: 'first user',
        email: 'first@user.com',
        password: 'user12345'
      },
      {
        id: 2,
        name: 'Second User',
        email: 'second@user.com',
        password: 'user12345'
      },
    ];

    // Get a list of users:
    app.get('/users', { name: 'users'}, (req, res) => {
        const term = req.query.term;
        let filtered = users;
        if (term) {
          filtered = users.filter((user) => user.name.toLowerCase().includes(term.toLowerCase()));
        } else {
          res.view('src/views/users/index', { users });
        }
        res.view('src/views/users/index', { users: filtered });
      });

    // Form for creating new user:
    app.get('/users/new', { name: 'newUser' }, (req, res) => {
        res.view('src/views/users/new');
    });

    // Create user:
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
        //states.users.push(user);
        users.push(user);
        //res.send(user);
        res.redirect(app.reverse('users'), { users });
      });

    //Find a specific user: 
    app.get('/users/:userId', { name: 'user' }, (req, res) => {
        const escapedId = sanitize(req.params.userId);
        //const user = users.find(({ id }) => id === escapedId);
        // test number id:
        const user = users.find(({ id }) => id === parseInt(escapedId));
        if (!user) {
          return res.status(404).send('User not found');
        }
        return res.view('src/views/users/show', { user });
    });


    // Form for en editing specific user:
    app.get('/users/:id/edit',  { name: 'editUser' }, (req, res) => {
      const { id } = req.params;
      const user = users.find((item) => item.id === parseInt(id));
      if (!user) {
        res.code(404).send({ message: 'User not found' });
      } else {
        res.view('src/views/users/edit', { user });
      }
    });

    // Обновление пользователя
    app.patch('/users/:id', { name: 'updateUser' }, (req, res) => {
      const { id } = req.params;
      const { name, email, password, passwordConfirmation, } = req.body;
      const userIndex = users.findIndex((item) => item.id === parseInt(id));
      if (userIndex === -1) {
        res.code(404).send({ message: 'User not found' });
      } else {
        users[userIndex] = { ...users[userIndex], name, email };
        // res.send(users[userIndex]);
        // in this sample we need convert number to string again:
        const stringId = id.toString();
        res.redirect(app.reverse('updateUser', { id: stringId }));
        // res.redirect('/users');
      }
    });

    // Удаление пользователя
    app.delete('/users/:id', (req, res) => {
      const { id } = req.params;
      const userIndex = states.users.findIndex((item) => item.id === parseInt(id));
      if (userIndex === -1) {
        res.code(404).send({ message: 'User not found' });
      } else {
        users.splice(userIndex, 1);
        res.redirect(app.reverse('users'));
      }
    });
  
    
    app.get('/users/:userId/post/:postId', (req, res) => {
        res.send(`User ID: ${req.params.userId}; Post ID: ${req.params.postId}`);
    });

    

    // app.get('/users', (req, res) => res.send(states));

    // app.get('/search', (req, res) => {
    //   const { id } = req.query;
    //   const user = state.users.find(user => user.id === parseInt(id)); // Приведение к одному типу и сравнение
    //   if (!user) {
    //     res.code(404).send({ message: 'User not found' })
    //   } else {
    //     res.send(user);
    //   }
    // });

    // app.get('/users/:userId', (req, res) => {
    //   res.send(`User ID: ${req.params.userId}`);
    // });

    // app.get('/users/:userId', (req, res) => {
    //   const escapedId = sanitize(req.params.userId);
    //   res.type('html');
    //   res.send(`<h1>${escapedId}</h1>`);
    // });


};

