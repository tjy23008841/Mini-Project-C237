const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// Set EJS as the view engine //
app.set('view engine', 'ejs');

// Middleware to parse url-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Create MySQL connection
const connection = mysql.createConnection({
// host: 'localhost',
//  user: 'root',
//  password: '',
//  database: 'quizzeria'
host: 'db4free.net',
user: 'quizzeria_',
password: 'Jungkook1997',
database: 'quizzeria'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Home route
app.get('/', (req, res) => {
  res.render('index'); // Assuming 'index.ejs' is your homepage template
});

// Route to render the Start Quiz page
app.get('/start-quiz', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send('Username is missing');
  }

  // Example: Fetch quiz data from database or define static quizzes
  const quizzes = [
    { id: 1, name: 'Math Quiz' },
    { id: 2, name: 'Science Quiz' },
    { id: 3, name: 'History Quiz' }
    // Add more quizzes as needed
  ];

  // Render the Start Quiz page with quiz options and username
  res.render('start-quiz', { quizzes: quizzes, username: username });
});

// Route to render quiz page
app.get('/quiz', (req, res) => {
  const { username } = req.query;
  const quizId = 1;

  // Query to fetch questions and their options
  const getQuestionsSql = `
    SELECT q.question_id, q.question_text, q.question_type, o.option_id, o.option_text
    FROM questions q
    LEFT JOIN options o ON q.question_id = o.question_id
    WHERE q.quiz_id = ?
    ORDER BY q.question_id, o.option_id;
  `;

  connection.query(getQuestionsSql, [quizId], (err, results) => {
    if (err) {
      console.error("Error fetching quiz questions:", err);
      return res.status(500).send("Error fetching quiz questions from database");
    }

    // Organize fetched data into questions with options
    const questions = [];
    let currentQuestion = null;

    results.forEach(row => {
      if (!currentQuestion || currentQuestion.question_id !== row.question_id) {
        // Create a new question object
        currentQuestion = {
          question_id: row.question_id,
          question_text: row.question_text,
          question_type: row.question_type,
          options: []
        };
        questions.push(currentQuestion);
      }

      // Add option to current question if it exists
      if (row.option_id) {
        currentQuestion.options.push({
          option_id: row.option_id,
          option_text: row.option_text
        });
      }
    });

    // Render the quiz page with questions and options
    res.render('quiz', { questions: questions });
  });
});

// Route to handle quiz submission and calculate score
app.post('/score', (req, res) => {
  const { username, quizId } = req.body; // Assuming quizId and username are sent in the request body

  // Example: Fetch correct answers from the database based on quiz ID
  const getQuestionsSql = "SELECT question_id, is_correct FROM questions WHERE quiz_id = ?";
  connection.query(getQuestionsSql, [quizId], (err, results) => {
    if (err) {
      console.error("Error fetching questions:", err);
      return res.status(500).send("Error fetching questions from database");
    }

    // Organize fetched data into questions with correct answers
    const questions = results;

    // Calculate score based on user's submitted answers
    let score = 0;
    questions.forEach(question => {
      const correctOptionId = question.is_correct;
      const userAnswer = req.body[`answer_${question.question_id}`]; // Accessing user's answer

      if (userAnswer && userAnswer === correctOptionId.toString()) {
        score++;
      }
    });

    // Render the score page with username and calculated score
    res.render('score', { username: username, score: score });
  });
});

// Route to render add quiz form
app.get('/addQuiz', (req, res) => {
  res.render('addquiz'); // Assuming 'addquiz' is your EJS file
});

// Route to handle quiz addition
app.post('/addQuiz', (req, res) => {
  const { quizName, quizDescription, createdBy } = req.body; 

  // Validate form data
  if (!quizName || !quizDescription || !createdBy) {
    return res.status(400).send('Quiz name, description, and creator are required');
  }

  const insertQuizSql = "INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)";
  connection.query(insertQuizSql, [quizName, quizDescription, createdBy], (err, results) => {
    if (err) {
      console.error("Error inserting quiz into database:", err);
      return res.status(500).send("Error inserting quiz into database");
    }

    res.redirect('/'); 
});
});


// Route to render delete page
app.get('/deleteQuiz', (req, res) => {
  const getQuizzesSql = "SELECT quiz_id, title, description FROM quizzes";

  connection.query(getQuizzesSql, (err, results) => {
    if (err) {
      console.error("Error fetching quizzes from database:", err);
      return res.status(500).send("Error fetching quizzes from database");
    }

    res.render('deleteQuiz', { quizzes: results });
  });
});

// Route to handle quiz deletion
app.post('/deleteQuiz', (req, res) => {
  const { quizId } = req.body;

  const deleteQuizSql = "DELETE FROM quizzes WHERE quiz_id = ?";
  connection.query(deleteQuizSql, [quizId], (err, results) => {
    if (err) {
      console.error("Error deleting quiz from database:", err);
      return res.status(500).send("Error deleting quiz from database");
    }

    res.redirect('/deleteQuiz'); // Redirect to delete page after successful deletion
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
