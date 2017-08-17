var express = require('express');
var router = express.Router();
var requestMods = require('myModules/requestMods');
var testMods = require('myModules/testMods');
var projectMods = require('myModules/projectMods');
var globalMods = require('myModules/globalMods');

// Get Tests list
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('tests');
    collection.find({},{},function(e,docs){
        requestMods.finishRequest(docs,res);
    });
});

// Get Test
router.get('/:id', function(req, res) {
    testMods.getTest(req,{_id: req.params.id},function(results) {
        requestMods.finishRequest(results,res);
    });
});

// Get Test Results
router.get('/:id/results', function(req, res) {
    testMods.getTestResults(req, false, function(results){
        requestMods.finishRequest(results, res);
    });
});

// Get Test Results
router.get('/:id/results_with_notes', function(req, res) {
    testMods.getTestResults(req, true, function(results){
        requestMods.finishRequest(results, res);
    });
});

// Find Test
router.post('/find', function(req, res) {
    var db = req.db;
    var collection = db.get('tests');
    collection.findOne(req.body,{},function(e,doc){
        requestMods.finishRequest(doc,res);
    });
});

// Add Test
router.post('/', function(req, res) {
    var ObjectId = require('mongodb').ObjectID;
    req.body.project_id = new ObjectId(req.body.project_id);
    var db = req.db;
    var collection = db.get('tests');
    collection.findOne({name: req.body.name, project_id: req.body.project_id},{}, function(err, doc){
        if(doc != null) {
            res.send({ status: 0, msg: 'Test already exists for the project', data: doc });
        }
        else {
            collection.insert(req.body, function(err, result){
                res.send(
                    (err === null) ? { status: 1, msg: 'Test added', data: result } : { status: 0, msg: err }
                );
            });
        }
    });
});

// Update Test
router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('tests');
    var testId = req.params.id;
    collection.update({'_id': testId},{$set: req.body}, function(err, result){
        res.send(
            (err === null) ? { status: 1, msg: 'Test updated', data: result } : { status: 0, msg: err }
        );
    });
});

// Delete Test
router.delete('/:id', function(req, res) {
    var ObjectId = require('mongodb').ObjectID;
    var response = {};
    globalMods.deleteObject(req, 'tests', {'_id': req.params.id}, function(results){
        response['tests'] = results;
        globalMods.deleteObject(req, 'results', {'test_id': new ObjectId(req.params.id)}, function(results){
            response['results'] = results;
            requestMods.finishRequest(response, res);
        });
    });
});

// Get Parent
router.get('/:id/parent', function(req,res) {
    var ObjectId = require('mongodb').ObjectID;
    testMods.getTest(req,{_id: req.params.id}, function(result){
        projectMods.getProject(req,{_id: result.project_id}, function(doc){
            requestMods.finishRequest(doc,res);
        });
    });
});

// Views

// Show Test
router.get('/:id/show', function(req, res) {
    res.render('test',{title: "Test Detail", id: req.params.id});
});

module.exports = router;