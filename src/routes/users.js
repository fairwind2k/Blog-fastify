import yup from 'yup';
import sanitize from 'sanitize-html';
import getUsers from '../utils/fakeUsers.js';
import { generateId } from '../utils/fakeUsers.js';

export default (app, db) => {

    const users = getUsers();

    const states = {
        users: [
          {
            id: 1,
            name: 'user',
            email: 'user@user.com',
            password: '12345'
          },
        ],
      }; 


    // Get a list of users:
    app.get('/users', { name: 'users'}, (req, res) => {
        const term = req.query.term;
        let filtered = users;
        if (term) {
          filtered = users.filter((user) => user.username.toLowerCase().includes(term.toLowerCase()));
        } else {
          res.view('src/views/users/index', { users });
        }
        res.view('src/views/users/index', { users: filtered });
      });

    // Form for creating new user:
    app.get('/users/new', (req, res) => {
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
          username: userData.name,
          email: userData.email,
          password: userData.password
        };
        //states.users.push(user);
        users.push(user);
        //res.send(user);
        res.redirect(app.reverse('users'), { users });
      });

    //Find a specific user: 
    app.get('/users/:userId', (req, res) => {
        const escapedId = sanitize(req.params.userId);
        const user = users.find(({ id }) => id === escapedId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        return res.view('src/views/users/show', { user });
    });


    // Form for en editing specific user:
    app.get('/users/:id/edit', (req, res) => {
      const { id } = req.params;
      const user = states.users.find((item) => item.id === parseInt(id));
      if (!user) {
        res.code(404).send({ message: 'User not found' });
      } else {
        res.view('src/views/users/edit', { user });
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

