import { faker } from '@faker-js/faker';

const createRandomCourse = () => ({
  id: faker.string.uuid(),
  title: faker.word.noun(10),
  description: faker.company.catchPhrase(),
});

export default () => {
  faker.seed(25);
  return faker.helpers.multiple(createRandomCourse, {
    count: 20,
  });
};
