const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/test',  (req, res) => {
    res.send('hahahaha');
    console.log('suuu');
  });

module.exports = router;