var User = require('../models/user');
const jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var util = {};
require('dotenv').config();
var CronJob = require('cron').CronJob;
var sendmail = require('sendmail')();
var kue = require('kue'),
    queue = kue.createQueue();

util.createScheduler = function(linkemail,duedate,task) {
  console.log(linkemail);
  console.log(duedate);
  console.log(task);
  console.log('create cron');
    queue.create('todo', {
        dueDate: duedate,
        to: linkemail,
        task: task
    }).priority('normal').attempts(2).save();
    new CronJob(duedate, function() {
        queue.process('todo', function(job, done) {
            email(job.data.to,job.data.task, done);
        });
        console.log('ngirim email');
    }, null, true, 'Asia/Jakarta');

    function email(address,task, done) {
        sendmail({
            from: 'todo@application.com',
            to: address,
            subject: `your next todo ${task}`,
            html: `your next todo ${task}`
        }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
        done();
    }

}

util.passportFacebook = function(token, refreshToken, profile, done, next) {
    process.nextTick(function() {

        User.findOne({
            'account.id': profile.id
        }, function(err, user) {

            if (err)
                return next(err);

            if (user) {

                return next(null, user);
            } else {

                var user = new User();
                user.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.username = profile.name.givenName;
                user.account.kind = 'facebook'
                user.account.id = profile.id;
                user.account.token = token;
                user.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                    if (err)
                        throw err;
                    return next(null, user);
                });
            }
        });
    });
}

util.passportAuth = function(username, password, next) {
    User.findOne({
        username: username
    }, (err, user) => {
        if (err) {
            return next(err);
        }
        if (user == null) {
            return next(null, {
                msg: 'username not match anyone'
            });
        }

        if (!passwordHash.verify(password, user.account.password)) {
            return next(null, {
                msg: 'password not match with username'
            });
        }
        return next(null, user);
    });
}

util.isValidUser = function(req, res, next) {
    let token;
    if (req.headers.token !== undefined) {
        token = req.headers.token.replace(/['"]+/g, '')

    } else if (req.body.token !== undefined) {
        token = req.body.token.replace(/['"]+/g, '')

    } else {
        res.send('u dont have token')
        return
    }


    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {

        if (decoded) {

            if (decoded.key === process.env.USER_VALIDATION) {
                req.username = decoded.username;
                next();
            } else {
                res.send('invalid user');
            }
        } else {

            res.send(err)
        }
    })
}



util.isValidAdmin = function(req, res, next) {

    jwt.verify(req.headers.token, process.env.SECRET_KEY, (err, decoded) => {

        if (decoded) {

            if (decoded.role === 'admin') {

                next()
            } else {
                res.send('you dont have authorize');
            }
        } else {
            res.send(err)
        }
    })
}

util.isValidUserOrAdmin = function(req, res, next) {
    jwt.verify(req.headers.token, process.env.SECRET_KEY, (err, decoded) => {
        if (decoded) {
            if (decoded.role === 'admin') {
                next()
            } else if (decoded.role === 'user') {
                console.log(decoded.id + ' ' + req.params.id);
                if (decoded.id === req.params.id) {
                    next()
                } else {
                    res.send('your user dont have authorize');
                }
            } else {
                res.send('you dont have authorize');
            }
        } else {
            res.send(err)
        }
    })
}




module.exports = util;
