import users from './users.js';
import courses from './courses.js';

const controllers = [
  courses,
  users
];

// export default (app, db) => controllers.forEach((f) => f(app, db));
export default (app) => controllers.forEach((f) => f(app));