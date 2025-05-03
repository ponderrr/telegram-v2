const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const database = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// singleton
database.connect();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/topics', topicRoutes);
app.use('/', messageRoutes);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;