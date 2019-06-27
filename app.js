const express = require('express');
const path = require('path');
const routes = require('./routes/router-main');
const bodyParser = require('body-parser');
const app = express();
const cons = require('consolidate');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');

const favicon = require('express-favicon');
app.use(favicon(path.join(__dirname,'', 'favicon.png')))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
module.exports = app;