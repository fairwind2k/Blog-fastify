import yup from 'yup';
import sanitize from 'sanitize-html';
import getCourses from '../utils/fakeCourses.js';
import { generateId } from '../utils/fakeUsers.js';

export default (app, db) => {

  //const courses = getCourses();

  const courses = [
    {
      id: 1,
      title: "JS: Массивы",
      description: "Курс про массивы в JavaScript",
    },
    {
      id: 2,
      title: "JS: Функции",
      description: "Курс про функции в JavaScript",
    },
    {
      id: 3,
      title: "JS: Объекты",
      description: "Курс про объекты в JavaScript",
    },
  ];

    // const state = {
  //   courses: [
  //     {
  //       id: 1,
  //       title: 'JS: Массивы',
  //       description: 'Курс про массивы в JavaScript',
  //     },
  //     {
  //       id: 2,
  //       title: 'JS: Функции',
  //       description: 'Курс про функции в JavaScript',
  //     },
  //     {
  //       id: 3,
  //       title: 'JS: Объекты',
  //       description: 'Курс про объекты в JavaScript',
  //     },
  //   ],
  // };

  app.get("/courses", { name: "courses" }, (req, res) => {
    const term = req.query.term;
    let selectedCourses = courses;
    if (term) {
      // Фильтруем курсы по term
      selectedCourses = courses.filter((item) =>
        item.title.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      //   // Извлекаем все курсы, которые хотим показать
      selectedCourses = courses.slice(0, 2);
    }
    res.view("src/views/courses/index", { courses: selectedCourses });
  });

    // app.get('/courses', (req, res) => {
    //   res.send(courses);
    // });

  app.get('/courses/new', (req, res) => {
    res.view('src/views/courses/new');
  });

  app.post(
    "/courses",
    {
      attachValidation: true,
      schema: {
        body: yup.object({
          title: yup.string().min(2),
          description: yup.string().min(5),
        }),
      },
      validatorCompiler:
        ({ schema, method, url, httpPart }) =>
        (data) => {
          try {
            const result = schema.validateSync(data);
            return { value: result };
          } catch (e) {
            return { error: e };
          }
        },
    },
    (req, res) => {
      const dataCourse = {
        title: req.body.title.trim(),
        description: req.body.description.trim(),
      };
      if (req.validationError) {
        const data = {
          ...dataCourse,
          error: req.validationError,
        };
        res.view("src/views/courses/new", data);
        return;
      }
      const newCourse = { id: generateId(), ...dataCourse };
      courses.push(newCourse);
      //res.send(newCourse);
      res.redirect(app.reverse('courses'), { courses });
    }
  );

  //  get all courses in one page:
  //
  // app.get('/courses', (req, res)=> {
  //   //const data = state.courses;
  //   const data = courses;
  //   res.view('src/views/courses/index', { data });
  // });
  
  app.get("/courses/:id", (req, res) => {
      const escapedCourseId = sanitize(req.params.id);
      // const course = state.courses.find((item) => item.id.toString() === escapedCourseId);
      const course = courses.find(
      (item) => item.id.toString() === escapedCourseId
      );
      if (!course) {
      return res.code(404).send({ message: "Course not found" });
      }
      const data = {
      course,
      };
      return res.view("src/views/courses/show", data);
  });

  app.get('/courses/:courseId/lessons/:lessonId', (req, res) => {
  res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.lessonId}`);
  }); 

    
};