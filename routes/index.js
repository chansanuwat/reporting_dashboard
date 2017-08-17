var express = require('express');
var router = express.Router();


// View

// Show the dashboard index
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Test Result Dashboard' });
});

module.exports = router;
