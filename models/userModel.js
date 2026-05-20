const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
    },

    username: {
      type: String,
      required: [true, 'اليوزرنيم مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'اليوزرنيم لازم 3 حروف على الأقل'],
      match: [/^[a-zA-Z0-9_]+$/, 'حروف وأرقام و _ فقط'],
    },

    email: {
      type: String,
      required: [true, 'الإيميل مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'إيميل غير صحيح'],
    },

    password: {
      type: String,
      required: [true, 'الباسورد مطلوب'],
      minlength: [6, 'الباسورد لازم 6 حروف على الأقل'],
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
