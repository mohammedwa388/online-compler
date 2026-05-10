const express          = require('express');
const editorController = require('../controllers/editorController');
const authController   = require('../controllers/authController');

const editorRouter = express.Router();

// languages مفتوح — مش محتاج login
editorRouter.get('/languages', editorController.getLanguages);

// run محتاج login
editorRouter.post('/run', authController.protect, editorController.runCode);

module.exports = editorRouter;
