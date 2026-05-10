const User = require('../models/userModel');

// GET /api/v1/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/v1/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'مفيش يوزر بالـ ID ده' });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/v1/users/:id
exports.updateUser = async (req, res) => {
  try {
    if (req.body.password)
      return res.status(400).json({ status: 'fail', message: 'الـ route ده مش لتغيير الباسورد' });

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ status: 'fail', message: 'مفيش يوزر بالـ ID ده' });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/v1/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'مفيش يوزر بالـ ID ده' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
