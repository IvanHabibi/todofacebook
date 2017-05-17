var express = require('express');
var router = express.Router();
var todoController = require("../controllers/todoController")
const util = require('../helpers/utils');

const passport = require('passport');

router.get('/', util.isValidUser ,todoController.getAllTaskbyUser);
router.post('/', util.isValidUser ,todoController.insertTaskToUser);
router.put('/status/:id', util.isValidUser ,todoController.statusTask);
router.put('/:id', util.isValidUser ,todoController.updateTask);
router.delete('/:id', util.isValidUser ,todoController.deleteTask);

module.exports = router;
