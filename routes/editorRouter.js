const express = require('express');
const editorController = require('../controllers/editorController');
const authController = require('../controllers/authController');

const editorRouter = express.Router();

editorRouter.get('/languages', editorController.getLanguages);

editorRouter.post('/run', authController.protect, editorController.runCode);

module.exports = editorRouter;
