import { faker } from '@faker-js/faker';

const createRandomUser = () => ({
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
});

export const generateId = () => faker.string.uuid();

export default () => {
  faker.seed(25);
  return faker.helpers.multiple(createRandomUser, {
    count: 5,
  });
};


