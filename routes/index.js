const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Registration = mongoose.model('Registration');
const Login = mongoose.model('Login');
const path = require('path');
const auth = require('http-auth');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var helmet = require('helmet')
var usernametidakada = false;
var passwordsalah = false;
const crypto = require('crypto');
const hash = crypto.createHmac('sha256', "Rahmat")
                   .update('I love cupcakes')
                   .digest('hex');
const jwt = require("jsonwebtoken");
var secret = "sadkowquenf&^^ASD9zxc((77sd2as@@";
var token = "";
app.use(cookieParser());
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 10000 }, resave: false, saveUninitialized: false , name: 'coba' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet())
passport.use(new LocalStrategy(
  
  function(username, password, done) {
      Login.findOne({
        username: username
    }, function (err, user, abc) {

      if (err) {
        return done(err);
      }

        if (!user) {
          usernametidakada = true;
          return done(null, false);
        }

        // if (user.password != password) {
        //   passwordsalah = true;
        //   return done(null, false);
        // }
        if(user){
          var saltDb = user.salt;
          console.log(saltDb);
          var username = user.username;
          var hash = crypto.pbkdf2Sync(password, saltDb,  
            1000, 64, `sha512`).toString(`hex`); 
          token = jwt.sign({ username }, secret, { expiresIn: '10000'});
          console.log(token);
          if(user.password == hash){
            
          console.log("login gan");
          return done(null, token);
          }
          else{
            passwordsalah = true;
          return done(null, false);
          }
        }
      });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

router.get('/', (req, res) =>{
  console.log(hash);
  if(req.user){
    res.redirect('/home');
  }
  else{
    if(usernametidakada == true){
      res.render('login',{pesan : 'username tidak ada!'});
      usernametidakada = false;
    }
    else if (passwordsalah == true){
      res.render('login', {pesan : 'username / password does not match'});
      passwordsalah = false;
    }
    else{
      res.render('login', {pesan : null});
    }
  }
})
router.post('/', passport.authenticate('local', { failureRedirect: '/'}),function (req, res) {
    jwt.verify(token, secret, function(err, decoded) {
      if(err){
        //If error send Forbidden (403)
        console.log('ERROR: Could not connect to the protected route');
        res.sendStatus(403);
    } else {
      res.redirect('/home');
        console.log('SUCCESS: Connected to protected route');
    }
})
}); 
router.get('/register',  (req, res) => {
  res.render('register');
});
router.get('/home' , function(req,res) {
  if(req.user == token){
    res.render('home',{nama: req.user});
  }
  else{
    res.redirect('/');
  }
  console.log(req.user);
})
router.post('/home' , function(req,res) {
console.log(req.body)
var salt = "5f55b5e2a81a793f2322ce4af2f3399a"; 
var hash = crypto.pbkdf2Sync(req.body.Name, salt,  
1000, 64, `sha512`).toString(`hex`); 

console.log(salt);
console.log(hash);

res.send('hpphphphp');
})
router.get('/logout', function(req,res){
  req.logOut();
  req.session.destroy(function (err) {
    res.redirect('/');
});
})

module.exports = router;