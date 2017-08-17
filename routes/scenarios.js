var express = require('express');
var router = express.Router();
var requestMods = require('myModules/requestMods');
var projectMods = require('myModules/projectMods');
var testMods = require('myModules/testMods');
var scenarioMods = require('myModules/scenarioMods');
var resultMods = require('myModules/resultMods');
var globalMods = require('myModules/globalMods');

// Get scenarios list
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('scenarios');
    collection.find({},{},function(e,docs){
        requestMods.finishRequest(docs,res);
    });
});

// Get scenario
router.get('/:id', function(req, res) {
    scenarioMods.getScenario(req,{_id: req.params.id}, function(doc){
        requestMods.finishRequest(doc,res);
    });
});

// Find scenario
router.post('/find', function(req, res) {
    var db = req.db;
    var collection = db.get('scenarios');
    collection.find(req.body,{},function(e,docs){
        requestMods.finishRequest(docs[0], res);
    });
});

// Add scenario
router.post('/', function(req, res) {
    var db = req.db;
    var collection = db.get('scenarios');
    var ObjectId = require('mongodb').ObjectID;
    req.body.project_id = new ObjectId(req.body.project_id);
    collection.findOne({name: req.body.name, project_id: req.body.project_id},{}, function(err, doc){
        if(doc != null) {
            res.send({ status: 0, msg: 'Scenario already exists for the project', data: doc });
        }
        else {
            collection.insert(req.body, function(err, result){
                res.send(
                    (err === null) ? { status: 1, msg: 'scenario added', data: result } : { status: 0, msg: err }
                );
            });
        }
    });
});

// Update scenario
router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('scenarios');
    var scenarioId = req.params.id;
    collection.update({'_id': scenarioId},{$set: req.body}, function(err, result){
        res.send(
            (err === null) ? { status: 1, msg: 'scenario updated' } : { status: 0, msg: err }
        );
    });
});

// Delete scenario
router.delete('/:id', function(req, res) {
    var ObjectId = require('mongodb').ObjectID;
    var response = {};
    globalMods.deleteObject(req, 'scenarios', {'_id': req.params.id}, function(results){
        response['scenarios'] = results;
        globalMods.deleteObject(req, 'results', {'scenario_id': new ObjectId(req.params.id)}, function(results){
            response['results'] = results;
            requestMods.finishRequest(response, res);
        });
    });
});

// Get Scenario Results
router.get('/:id/results', function(req, res){
    var ObjectId = require('mongodb').ObjectID;
    resultMods.getResultsWithTest(req,{scenario_id: new ObjectId(req.params.id)}, false, function(results){
        requestMods.finishRequest(results,res);
    });
});

// Get Scenario Results with notes
router.get('/:id/results_with_notes', function(req, res){
    var ObjectId = require('mongodb').ObjectID;
    resultMods.getResultsWithTest(req,{scenario_id: new ObjectId(req.params.id)}, true, function(results){
        requestMods.finishRequest(results,res);
    });
});

// Get Parent
router.get('/:id/parent', function(req,res) {
    scenarioMods.getScenario(req,{_id: req.params.id}, function(result){
        projectMods.getProject(req,{_id: result.project_id}, function(doc){
            requestMods.finishRequest(doc,res);
        });
    });
});

// Views

// Show Scenario
router.get('/:id/show', function(req, res) {
    res.render('scenario',{title: "Scenario Detail", id: req.params.id});
});

module.exports = router;