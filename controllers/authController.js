const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (res, statusCode, user, token) =>
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    },
  });

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'من فضلك ادخل كل البيانات المطلوبة',
      });
    }

    const name = `${firstName.trim()} ${lastName.trim()}`;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'الإيميل' : 'اليوزرنيم';
      return res.status(400).json({
        status: 'fail',
        message: `${field} ده موجود بالفعل`,
      });
    }

    const newUser = await User.create({ name, username, email, password });

    const token = signToken(newUser._id);
    sendTokenResponse(res, 201, newUser, token);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)
        .map((e) => e.message)
        .join('. ');
      return res.status(400).json({ status: 'fail', message: msg });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'من فضلك ادخل الإيميل والباسورد',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isPasswordCorrect(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'الإيميل أو الباسورد غلط',
      });
    }

    const token = signToken(user._id);
    sendTokenResponse(res, 200, user, token);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'مش مسجل دخول — اعمل login أول',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'اليوزر صاحب الـ token ده مش موجود',
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Token غير صالح أو انتهت صلاحيته — اعمل login تاني',
    });
  }
};
