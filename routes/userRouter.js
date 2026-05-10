const express        = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

// كل الـ routes دي محتاجة login (protect)
userRouter.use(authController.protect);

userRouter.route('/').get(userController.getAllUsers);
userRouter.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
