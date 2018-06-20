var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



//Variables linking to the routes
const introduction = require('./routes/intro');
const indexRouter = require('./routes/index');
const team = require('./routes/team');
const file_Upload = require('./routes/fileUpload');
const visualization = require('./routes/visualization');
const report = require('./routes/report');
const deleteTree = require('./routes/deleteTree');

const testing = require('./routes/testing');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'convertedTrees')));
app.use(express.static(path.join(__dirname, 'lib')));




//Routing defining
app.use('/', introduction);
app.use('/intro', indexRouter);
app.use('/team', team);
app.use('/file_upload', file_Upload);
app.use('/testing', testing);
app.use('/visualization', visualization);
app.use('/report', report);
app.use('/deleteTree', deleteTree);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
