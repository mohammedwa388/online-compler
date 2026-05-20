const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const editorRouter = require('./routes/editorRouter');

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('./public'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const cors = require('cors');
app.use(cors());

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/editor', editorRouter);

// 404
app.all('*', (req, res) =>
  res
    .status(404)
    .json({ status: 'fail', message: `المسار ${req.originalUrl} مش موجود` }),
);

module.exports = app;
