var express = require('express');
var router = express.Router();
var index  = require('./index');
var test  = require('./test');

router.use('/',index);
router.use('/test',test);
router.use(function (req, res) {
    res.status(404).render('404');
  });

module.exports = router