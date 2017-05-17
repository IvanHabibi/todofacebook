var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var todoSchema = new Schema({
    task: String,
    status: Boolean,
    duedate: String,
    createdAt:{
      type : Date,
      default :new Date().toISOString()
    }
});

var Todo = mongoose.model('todos', todoSchema);

module.exports = Todo;
