const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');

// ════════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════════

// بيعمل JWT token من الـ user id
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// بيبعت الـ token + بيانات اليوزر في الـ response
const sendTokenResponse = (res, statusCode, user, token) =>
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id:       user._id,
        name:     user.name,
        username: user.username,
        email:    user.email,
      },
    },
  });

// ════════════════════════════════════════════════════════════════════
//  REGISTER — POST /api/v1/auth/register
//  بياخد: firstName, lastName, username, email, password
// ════════════════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // 1) تحقق من الحقول المطلوبة
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        status:  'fail',
        message: 'من فضلك ادخل كل البيانات المطلوبة',
      });
    }

    // 2) الـ name بيتبني من firstName + lastName
    const name = `${firstName.trim()} ${lastName.trim()}`;

    // 3) تحقق لو الإيميل أو اليوزرنيم موجود
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'الإيميل' : 'اليوزرنيم';
      return res.status(400).json({
        status:  'fail',
        message: `${field} ده موجود بالفعل`,
      });
    }

    // 4) إنشاء اليوزر — الباسورد هيتعمله hash في الـ pre-save hook
    const newUser = await User.create({ name, username, email, password });

    // 5) ابعت الـ token
    const token = signToken(newUser._id);
    sendTokenResponse(res, 201, newUser, token);

  } catch (err) {
    // Mongoose validation errors — بتيجي من الـ schema
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('. ');
      return res.status(400).json({ status: 'fail', message: msg });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════
//  LOGIN — POST /api/v1/auth/login
//  بياخد: email, password
// ════════════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status:  'fail',
        message: 'من فضلك ادخل الإيميل والباسورد',
      });
    }

    // لازم نجيب الباسورد صراحةً لأن select: false في الـ model
    const user = await User.findOne({ email }).select('+password');

    // رسالة مبهمة عن قصد — عشان المهاجم ما يعرفش إيه الغلط
    if (!user || !(await user.isPasswordCorrect(password))) {
      return res.status(401).json({
        status:  'fail',
        message: 'الإيميل أو الباسورد غلط',
      });
    }

    const token = signToken(user._id);
    sendTokenResponse(res, 200, user, token);

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════
//  PROTECT MIDDLEWARE
//  بيتحقق من الـ JWT قبل أي route محمي
//  استخدامه: router.get('/x', authController.protect, controller.fn)
// ════════════════════════════════════════════════════════════════════
exports.protect = async (req, res, next) => {
  try {
    // 1) جيب الـ token من الـ header
    //    الـ frontend بيبعت: Authorization: Bearer <token>
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status:  'fail',
        message: 'مش مسجل دخول — اعمل login أول',
      });
    }

    // 2) تحقق من صحة الـ token وفك تشفيره
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: '...', iat: ..., exp: ... }

    // 3) تأكد إن اليوزر لسه موجود في الـ DB
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status:  'fail',
        message: 'اليوزر صاحب الـ token ده مش موجود',
      });
    }

    // 4) حط اليوزر على الـ request عشان الـ controller الجاي يستخدمه
    req.user = currentUser;
    next();

  } catch (err) {
    res.status(401).json({
      status:  'fail',
      message: 'Token غير صالح أو انتهت صلاحيته — اعمل login تاني',
    });
  }
};
