var method = {}
var Todo = require("../models/todo");
var User = require("../models/user");
var userController = require("../controllers/userController")
const util = require('../helpers/utils');
require('dotenv').config();


method.getAllTaskbyUser = (req, res) => {
    User.findOne({
        username: req.username
    }, function(err, user) {
        if (err) {
            // res.send(err)
            res.send({msg:'todo empty'})
        }
    }).populate('todolist').exec((err, result) => {
        if (result) {
            res.send(result.todolist)
        } else {
            res.send(`ERR getall :\n ${err}`)
        }
    })
}



method.insertTaskToUser = (req, res) => {

    var todo = new Todo({
        task: req.body.task,
        status: false,
        dueDate: req.body.duedate,
        createdAt: req.body.date || new Date().toISOString()
    });
    todo.save(function(err, todo) {
        if (err) {
            res.send(err);
        }
        User.findOne({
            username: req.username
        }, function(err, user) {
            if (err) {

                res.send(err)
            } else {
              util.createScheduler(user.email,req.body.duedate,req.body.task)
                if (user.todolist == undefined) {
                    user.todolist = todo.id
                } else {
                    user.todolist.push(todo.id)
                }
                user.save(function(err, user) {
                    if (err) {
                        res.send(err)
                    }
                    res.send(user);
                });

            }
        })
    });
}

method.statusTask = (req, res) => {
        Todo.findById(req.params.id, function(err, todo) {

                if (err) {
                    res.send(err);
                } else {

                    if (todo.status === false) {
                        todo.status = true
                    } else {
                        todo.status = false
                    }
                    todo.save(function(err, todo) {
                        if (err) {
                            res.send(err)
                        }

                        res.send(todo);
                    });
                }
            })
        }

        method.updateTask = (req, res) => {
          console.log(req.body.task);
                Todo.findById(req.params.id, function(err, todo) {

                        if (err) {
                            res.send(err);
                        } else {
                          todo.task = req.body.task || todo.task
                            todo.save(function(err, todo) {
                                if (err) {
                                    res.send(err)
                                }

                                res.send(todo);
                            });
                        }
                    })
                }

                method.deleteTask = (req, res) => {
                    Todo.findByIdAndRemove(req.params.id, function(err, user) {
                        var response = {
                            message: "todo successfully deleted",
                            id: user._id
                        };
                        res.send(response);
                    });
                }







        module.exports = method;
