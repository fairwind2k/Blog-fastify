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

  app.get("/courses", { name: "courses" }, (req, res) => {
    db.all('SELECT * FROM courses', (error, data) => {
      const templateData = {
        courses: data,
        flash: res.flash(),
        error,
      };
      console.log('templateData', templateData);
      res.view('src/views/courses/index', templateData);
    });
  });

  app.get('/courses/new', { name: 'newCourse' }, (req, res) => {
    res.view('src/views/courses/new');
  });

  app.get('/courses/:id', { name: 'course' }, (req, res) => {
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
        // console.log('this.lastID', this.lastID);
        req.flash('success', 'Курс успешно создан');
        res.redirect(app.reverse('courses'));
      });
  });
 
  app.get('/courses/:courseId/lessons/:lessonId', (req, res) => {
    res.send(`Course ID: ${req.params.courseId}; Lesson ID: ${req.params.lessonId}`);
  });

  // Form for en editing specific course:
  app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'Course not found');
        res.redirect(app.reverse('courses'));
        return;
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      };
      res.view('src/views/courses/edit', templateData);
    });
  });

  // Updating specific course:
  app.patch('/courses/:id', { name: 'updateCourse' }, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?');
    stmt.run([title, description, id], function (error) {
      if (error) {
        console.error('Database error:', error);
        req.flash('warning', 'Ошибка обновления курса');
        res.redirect(app.reverse('course', { id }));
        return;
      }
      req.flash('success', 'Курс успешно обновлен');
      res.redirect(app.reverse('courses'));
    });   
  });
  
  // Deleting a specific course:
  app.delete('/courses/:id', { name: 'deleteCourse' }, (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    stmt.run([id], function (error) {
      if (error) {
        console.error('Database error:', error);
        req.flash('warning', 'Ошибка удаления курса');
        res.redirect(app.reverse('course', { id }));
        return;
      }
      req.flash('success', 'Курс успешно удален');
      res.redirect(app.reverse('courses'));
    });
  });
    
};