var express = require('express');
var router = express.Router();
var testMods = require('myModules/testMods');
var globalMods = require('myModules/globalMods');
var requestMods = require('myModules/requestMods');

// Get result
router.get('/:id', function(req, res) {
    testMods.getTestResult(req, function(results){
        requestMods.finishRequest(results, res);
    });
});

// Add result
router.post('/', function(req, res) {
    var db = req.db;
    var collection = db.get('results');
    var ObjectId = require('mongodb').ObjectID;
    req.body.forEach(function(result) {
        result['test_id'] = new ObjectId(result['test_id']);
        result['scenario_id'] = new ObjectId(result['scenario_id']);
    });
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { status: 1, msg: 'result added', data: result } : { status: 0, msg: err }
        );
    });
});

// Update result
router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('results');
    var resultId = req.params.id;
    collection.update({'_id': resultId},{$set: req.body}, function(err, result){
        res.send(
            (err === null) ? { status: 1, msg: 'result updated', data: result } : { status: 0, msg: err }
        );
    });
});

// Delete result
router.delete('/:id', function(req, res) {
    globalMods.deleteObject(req, 'results', {'_id': req.params.id}, function(results){
        requestMods.finishRequest(results, res);
    });
});

module.exports = router;