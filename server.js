const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const dataFile = './data.json';

// Read quizzes
app.get('/quizzes', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

// Create a new quiz
app.post('/quizzes', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const quizzes = JSON.parse(data);
    quizzes.push(req.body);
    fs.writeFile(dataFile, JSON.stringify(quizzes), (err) => {
      if (err) throw err;
      res.status(201).send('Quiz added');
    });
  });
});

// Update a quiz
app.put('/quizzes/:id', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    const quizzes = JSON.parse(data);
    const quizIndex = quizzes.findIndex(q => q.id === req.params.id);
    if (quizIndex !== -1) {
      quizzes[quizIndex] = req.body;
      fs.writeFile(dataFile, JSON.stringify(quizzes), (err) => {
        if (err) throw err;
        res.send('Quiz updated');
      });
    } else {
      res.status(404).send('Quiz not found');
    }
  });
});

// Delete a quiz
app.delete('/quizzes/:id', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) throw err;
    let quizzes = JSON.parse(data);
    quizzes = quizzes.filter(q => q.id !== req.params.id);
    fs.writeFile(dataFile, JSON.stringify(quizzes), (err) => {
      if (err) throw err;
      res.send('Quiz deleted');
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
