import yup from 'yup';
import sanitize from 'sanitize-html';
import getCourses from '../utils/fakeCourses.js';
import { generateId } from '../utils/fakeUsers.js';

export default (app, db) => {

  //const courses = getCourses();

  const courses = [
    {
      id: '1a',
      title: "JS: Массивы",
      description: "Курс про массивы в JavaScript",
    },
    {
      id: '2a',
      title: "JS: Функции",
      description: "Курс про функции в JavaScript",
    },
    {
      id: '3a',
      title: "JS: Объекты",
      description: "Курс про объекты в JavaScript",
    },
  ];

  // app.get("/courses", { name: "courses" }, (req, res) => {
  //   const term = req.query.term;
  //   let selectedCourses = courses;
  //   if (term) {
  //     // Фильтруем курсы по term
  //     selectedCourses = courses.filter((item) =>
  //       item.title.toLowerCase().includes(term.toLowerCase())
  //     );
  //   } else {
  //     //   // Извлекаем все курсы, которые хотим показать
  //     selectedCourses = courses.slice(0, 5);
  //   }
  //   res.view("src/views/courses/index", { courses: selectedCourses });
  // });

  app.get("/courses", { name: "courses" }, (req, res) => {
    db.all('SELECT * FROM courses', (error, data) => {
      const templateData = {
        courses: data,
        flash: res.flash(),
        error,
      };
      res.view('src/views/courses/index', templateData);
    });
  });

  app.get('/courses/new', { name: 'newCourse' }, (req, res) => {
    res.view('src/views/courses/new');
  });

  app.get('/courses/:id', (req, res) => {
    const id = sanitize(req.params.id);
    if (!Number.isInteger(Number(id)) || id <= 0) {
      req.flash('warning', 'Некорректный идентификатор курса');
      return res.redirect(app.reverse('courses'));
    }
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'course not found');
        res.redirect(app.reverse('courses'));
        return;
      }
      if (!data) {
        req.flash('warning', 'Курс не найден');
        res.redirect(app.reverse('courses'));
        return;
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      };
      res.view("src/views/courses/show", templateData);
    });
  }); 

  app.post("/courses",
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
      const { title, description } = req.body;

      if (req.validationError) {
        req.flash('warning', req.validationError);
        const data = {
          title,
          description,
          flash: res.flash(),
        };
        res.view("src/views/courses/new", data);
        return;
      }
      const course = {
        title,
        description,
      };
      
      const stmt = db.prepare('INSERT INTO courses(title, description) VALUES(?, ?)');
      stmt.run([course.title, course.description], function (error) {
        if (error) {
          console.error('Database error:', error);
          req.flash('warning', 'Ошибка создания курса');
          res.redirect(app.reverse('newCourse'));
          return;
        }
        req.flash('success', 'Курс успешно создан');
        res.redirect(`/courses/${this.lastID}`);
      });
  });
 
  // app.get("/courses/:id", (req, res) => {
  //     const escapedCourseId = sanitize(req.params.id);
  //     // const course = state.courses.find((item) => item.id.toString() === escapedCourseId);
  //     const course = courses.find(
  //     (item) => item.id.toString() === escapedCourseId
  //     );
  //     if (!course) {
  //     return res.code(404).send({ message: "Course not found" });
  //     }
  //     const data = {
  //     course,
  //     };
  //     return res.view("src/views/courses/show", data);
  // });

  // app.get('/courses/:id', (req, res) => {
  //   const id = sanitize(req.params.id);
  //   db.get(`SELECT * FROM courses WHERE id = ${id}`, (err, data) => {
  //     const templateData = {
  //       course: data,
  //       error: err,
  //     };
  //     console.log('templateData:', templateData);
  //     res.view("src/views/courses/show", templateData);
  //   });
  // });    

  app.get('/courses/:courseId/lessons/:lessonId', (req, res) => {
    res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.lessonId}`);
  });

  // Form for en editing specific course:
  app.get('/courses/:id/edit',  { name: 'editCourse' }, (req, res) => {
    const { id } = req.params;
    const course = courses.find((item) => item.id === id);
    if (!course) {
      res.code(404).send({ message: 'Course not found' });
    } else {
      res.view('src/views/courses/edit', { course });
    }
  });

  // Updating specific course:
  app.patch('/courses/:id', { name: 'updateCourse' }, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const courseIndex = courses.findIndex((item) => item.id === id);
    if (courseIndex === -1) {
      res.code(404).send({ message: 'User not found' });
    } else {
      courses[courseIndex] = { ...courses[courseIndex], title, description };
      // in this sample we need convert number to string again:
      // const stringId = id.toString();
      res.redirect(app.reverse('updateCourse', { id }));
    }
  });

  // Deleting a specific course:
  app.delete('/courses/:id', { name: 'deleteCourse' }, (req, res) => {
    const { id } = req.params;
    const courseIndex = courses.findIndex((item) => item.id === id);
    if (courseIndex === -1) {
      res.code(404).send({ message: 'Course not found' });
    } else {
      courses.splice(courseIndex, 1);
      res.redirect(app.reverse('courses'));
    }
  });

    
};