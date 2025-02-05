import users from './users.js';
import courses from './courses.js';
import sessions from './sessions.js';

const controllers = [
  courses,
  users,
  sessions,
];

export default (app, db) => controllers.forEach((f) => f(app, db));
