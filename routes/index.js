const express = require('express'); // express
const mongoose = require('mongoose'); // mongodb package
const router = express.Router();
const Registration = mongoose.model('Registration'); // model for mongodb
const Login = mongoose.model('Login');
const Status = mongoose.model('Status');
const path = require('path');
const auth = require('http-auth'); // package for secure api
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});
var cors = require('cors') // cross origin package
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy; //package passport
var usernametidakada = false;
var passwordsalah = false;
const crypto = require('crypto'); //package crypto
const hash = crypto.createHmac('sha256', "Rahmat") 
  .update('I love cupcakes')
  .digest('hex');
const jwt = require("jsonwebtoken"); // jwt package
var secret = "sadkowquenf&^^ASD9zxc((77sd2as@@"; //secret for jwt
var token = "";
var moment = require('moment'); // moment js package (time js)
const sql = require("mssql"); // sql package
// config for your sql database
const config = {
    user: 'sa',
    password: 'password.1',
    server: 'RAHMATKU', 
    database: 'TODO' 
};
const testService= require('../services/services') // calling another js file (services)
passport.use(new LocalStrategy(
  function (username, password, done) {
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
      if (user) {
        var saltDb = user.salt;
        var username = user.username;
        var hash = crypto.pbkdf2Sync(password, saltDb,
          1000, 64, `sha512`).toString(`hex`);
        token = jwt.sign({ username }, secret, { expiresIn: '1h' });
        if (user.password == hash) {
          return done(null, token);
        }
        else {
          passwordsalah = true;
          return done(null, false);
        }
      }
    });
  }
));
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
router.use(cors())
router.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/home');
  }
  else {
    if (usernametidakada == true) {
      res.render('login', { pesan: 'username tidak ada!' });
      usernametidakada = false;
    }
    else if (passwordsalah == true) {
      res.render('login', { pesan: 'username / password does not match' });
      passwordsalah = false;
    }
    else {
      res.render('login', { pesan: null });
    }
  }
})
router.post('/', passport.authenticate('local', { failureRedirect: '/' }), function (req, res) {
  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      //If error send Forbidden (403)
      console.log('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      res.redirect('/home');
      console.log('SUCCESS: Connected to protected route');
    }
  })
});
router.get('/register', (req, res) => {
  res.render('register');
});
router.get('/home', function (req, res) {
  if (req.user == token) {
    var obj = jwt.verify(token, secret);

    Status.find({}).sort({pDate: 'desc'}).limit(10).exec(function(err, doc) { 
      if(doc.length > 0){
        var data = { nama: obj.username, status: doc, moment: moment };
        res.render('home', data);
      }
      else{
        res.render('home', {nama: obj.username, status: null});
      }

     });
  }
  else {
    res.redirect('/');
  }
})
router.post('/home', function (req, res) {
  // var salt = "5f55b5e2a81a793f2322ce4af2f3399a";
  // var hash = crypto.pbkdf2Sync(req.body.Name, salt,
  //   1000, 64, `sha512`).toString(`hex`);

  // console.log(salt);
  // console.log(hash);

  res.send('hpphphphp');
})
router.get('/logout', function (req, res) {
  req.logOut();
  req.session.destroy(function (err) {
    res.redirect('/');
  });
})

router.get('/getreact', function (req, res) {
  res.sendFile('./public/build/index.html')
})

router.get('/profile', function (req, res) {
  // if (req.user == token) {
    var userData = jwt.verify(token, secret)
    res.render('profile', { nama: userData.username, profileName : req.params.username})
  // }
  // else {
  //   res.redirect('/');
  // }
})

//API
router.post('/api/register', function (req, res) {
  Login.find({
    username: req.body.username
  }, function (err, doc) {
    var pesan;
    var status;
    if (err) {
      console.log(err);
    }
    if (doc.length > 0) {
      console.log('sudah ada')
      pesan = "Username Sudah Digunakan!!"
      status = 0;
    }
    else {
      var salt = crypto.randomBytes(16).toString('hex');
      var password = crypto.pbkdf2Sync(req.body.password, salt,
        1000, 64, 'sha512').toString('hex');
      var obj = { username: req.body.username, password: password, salt: salt }
      Login.insertMany(obj, function (err, res) {
        if (err) {
          console.log(err);
        }
      })
    pesan = "Registrasi Berhasil!"
    status = 1;
    }

    res.send({ Pesan: pesan, Status: status });
  })
})

router.post('/api/chkUser', auth.connect(basic), function (req, res) {
  Login.find({
    username: req.body.username
  }, function (err, usr) {
    var result;
    if (usr.length > 0) {
      result = 0;
    }
    else {
      result = 1;
    }
    res.send({ Result: result });
  })
})

router.post('/api/pstatus', function (req, res) {
  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      //If error send Forbidden (403)
      console.log('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      var objData = { content: req.body.content, pUser: decoded.username, pDate: new Date() }
      Status.insertMany(objData, function (err, res) {
        if (err) {
          console.log(err);
        }
      })
      res.sendStatus(200);
    }
  })
})

router.post('/api/login', function(req , res){
  Login.findOne({
    username: req.body.username
  }, function (err, user) {

    if (err) {
      res.json({error : err})
    }

    if (!user) {
      res.json({status: 0, message: 'username tidak ada'})
    }
    if (user) {
      var saltDb = user.salt;
      var username = user.username;
      var hash = crypto.pbkdf2Sync(req.body.password, saltDb,
        1000, 64, `sha512`).toString(`hex`);
      if (user.password == hash) {
        token = jwt.sign({ username }, secret, { expiresIn: '1h' });
        res.json({status: 1, message: 'successfuly', user: token})
      }
      else {
         res.json({status: 2, message: 'username and password does not match'})
      }
    }
  });
})
router.all('/api/vertify', function(req, res){
  var result = testService.vertify(req);
  if(result){
    res.send(true)
  }
  else{
    res.send(false)
  }
})
router.get('/api/cobaget', function(req, res) {
  
  jwt.verify(req.headers['jwt'], secret, function (err, decoded) {
    if (err) {
      res.json('token is not accepted');
    } else {
      res.json({message: 'token accepted'})
    }
  })
})
router.post('/api/createtodo', function (req, res) {
  sql.close();
  // connect to your database
  sql.connect(config, function (err) {
  
      if (err) console.log(err);
      
      // create Request object
      var request = new sql.Request();
      var parameters = [
        {name : 'TaskName', sqltype : sql.VarChar(50), value : req.body.TaskName },
        {name : 'TaskDetails', sqltype : sql.VarChar(50), value : req.body.TaskDetails},
        {name : 'TaskDate', sqltype : sql.VarChar(50), value : req.body.TaskDate},
        {name : 'TaskStatus', sqltype : sql.Int, value : 1},
        {name : 'CreatedBy', sqltype : sql.VarChar(50), value : req.body.Username},
      ]
      parameters.forEach(function(p) {
        request.input(p.name, p.sqltype, p.value);
      });
      // query to the database and get the records
      request.execute('[dbo].[USP_InsertToDo]', function (err, recordset) {
          
          if (err) console.log(err)

          ////commit damnit
          // const transaction = new sql.Transaction()
          // transaction.begin(err => {
          //     // ... error checks
           
          //     transaction.commit(err => {
          //         // ... error checks
          //     })
          // })
          
          // send records as a response
          res.send('Sippp');
      });
      
  });
});

router.get('/api/gettodo', function(req, res) {
  sql.close();
  sql.connect(config, function (err) {
  
    if (err) console.log(err);
    
    // create Request object
    var request = new sql.Request();
    // query to the database and get the records
    request.execute('[dbo].[USP_GetAllTask]', function (err, recordset) {
        if (err) console.log(err)
        // send records as a response
        res.send(recordset.recordsets);
    });
  });
})

router.post('/api/deleteTask', function(req, res) {
  sql.close();
  // const transaction = new sql.Transaction(config)
  sql.connect(config, function (err) {
  
    if (err) console.log(err);
    
    // create Request object
    var request = new sql.Request();
    request.input('Id', sql.Int, req.body.Id)
    // query to the database and get the records
    request.execute('[dbo].[USP_DeleteToDo]', function (err, recordset) {
        if (err) console.log(err)
        // send records as a response
        res.send({Status : "OK"});
    });
  });
})
router.post('/api/updateTask', function(req, res) {
  sql.close();
  sql.connect(config, function (err) {
  
    if (err) console.log(err);
    
    // create Request object
    var request = new sql.Request();
    var parameters = [
      {name : 'TaskName', sqltype : sql.VarChar(50), value : req.body.TaskName },
      {name : 'TaskDetails', sqltype : sql.VarChar(50), value : req.body.TaskDetails},
      {name : 'TaskDate', sqltype : sql.VarChar(50), value : req.body.TaskDate},
      {name : 'TaskStatus', sqltype : sql.Int, value : req.body.TaskStatus},
      {name : 'Id', sqltype : sql.Int, value : req.body.Id},
    ]
    parameters.forEach(function(p) {
      request.input(p.name, p.sqltype, p.value);
    });
    // query to the database and get the records
    request.execute('[dbo].[USP_UpdateToDo]', function (err, recordset) {
        
        if (err) console.log(err)

        ////commit damnit
        // const transaction = new sql.Transaction()
        // transaction.begin(err => {
        //     // ... error checks
         
        //     transaction.commit(err => {
        //         // ... error checks
        //     })
        // })
        
        // send records as a response
        res.send('Sippp');
    });
  });
})
module.exports = router;