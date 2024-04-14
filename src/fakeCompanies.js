import { faker } from '@faker-js/faker';

const createRandomCompany = () => ({
    id: faker.string.uuid(),
    username: faker.company.name(),
    phone: faker.phone.number(),
  });

const getCompanies = () => {
faker.seed(123);
return faker.helpers.multiple(createRandomCompany, {
    count: 50,
});
};

export default getCompanies;
