var express = require('express');
var router = express.Router();
var requestMods = require('myModules/requestMods');
var projectMods = require('myModules/projectMods');
var testMods = require('myModules/testMods');
var globalMods = require('myModules/globalMods');

// Get Project list
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('projects');
    collection.find({},{sort: {name: 1}},function(e,docs){
        requestMods.finishRequest(docs, res);
    });
});

// Get Project
router.get('/:id', function(req, res) {
    projectMods.getProject(req, {"_id": req.params.id}, function(result){
        requestMods.finishRequest(result,res);
    });
});

// Find Project
router.post('/find', function(req, res) {
    projectMods.getProject(req, req.body, function(result){
        requestMods.finishRequest(result,res);
    });
});

// Add project
router.post('/', function(req, res) {
    var db = req.db;
    var collection = db.get('projects');
    console.log(req.body.name);
    collection.findOne({name: req.body.name},{}, function(err, doc){
        console.log(doc)
        if(doc != null) {
            res.send({ status: 0, msg: 'Project already exists', data: doc });
        }
        else {
            collection.insert(req.body, function(err, result){
                res.send(
                    (err === null) ? { status: 1, msg: 'Project added', data: result } : { status: 0, msg: err }
                );
            });
        }
    });
});

// Update project
router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('projects');
    var projectId = req.params.id;
    collection.update({'_id': projectId},{$set: req.body}, function(err, result){
        res.send(
            (err === null) ? { status: 1, msg: 'Project updated', data: result } : { status: 0, msg: err }
        );
    });
});

// Delete Project
router.delete('/:id', function(req, res) {
    var ObjectId = require('mongodb').ObjectID;
    var response = {};
    var resultsDeleted = 0;
    var projectId = new ObjectId(req.params.id);

    removeResults(projectId, finishProjectRemoval);

    function removeResults(projId, next){
      testMods.getTests({'project_id': projId},{},req,function(tests){

            // If tests exists for the project, delete any results
            if(tests.length > 0){
                console.log("in tests loop");
                
                var processed = 0;
                // Delete all results for all tests under the project
                tests.forEach((doc,index,array) => {
                    globalMods.deleteObject(req, 'results', {'test_id': doc._id}, function(results){
                        processed ++;
                        resultsDeleted += results.records_deleted;
                        
                        // Once all tests' results have been deleted, continue the project deletion
                        if(processed === array.length){
                            response['results'] = {msg: 'Deleted results', records_deleted: resultsDeleted}
                            next(req,res);
                        }
                    });
                });  
            }
            
            // If there are no related tests, continue the project deletion
            else {
                response['results'] = {msg: 'Deleted results', records_deleted: 0};
                next(req,res);
            }
        });  
    };
    
    function finishProjectRemoval(req,res){

        // Delete any related scenarios
        globalMods.deleteObject(req, 'scenarios', {'project_id': projectId}, function(results){
            response['scenarios'] = results;

            // Delete any related tests
            globalMods.deleteObject(req, 'tests', {'project_id': projectId}, function(results){
                response['tests'] = results;

                // Delete the project
                globalMods.deleteObject(req, 'projects', {'_id': req.params.id}, function(results){
                    response['projects'] = results;
                    requestMods.finishRequest(response, res);
                });
            });
        });
    }
});

// Get Project Tests
router.get('/:id/tests', function( req, res) {
    var ObjectId = require('mongodb').ObjectID;
    testMods.getTests({"project_id": new ObjectId(req.params.id)},{sort: {_id: -1}},req, function(results){
        requestMods.finishRequest(results,res);
    });
});

// Last run
router.get('/:id/last_run', function(req, res) {
    getData(req,requestMods.finishRequest);

    function getData(req,callback) {
        var db = req.db;
        var collection = db.get('tests');
        var ObjectId = require('mongodb').ObjectID;
        collection.findOne({'project_id': new ObjectId(req.params.id)},{sort: {_id: -1}},function(e,doc){
            if(e || doc === null){
                callback({}, res);
            }
            else {
                testMods.getTestSummary(req,doc._id, function(summary){
                    doc['summary'] = summary;
                    callback(doc, res);
                });
            };
        });
    };
});

// Last run status
router.get('/:id/last_run_status', function(req, res) {
    var db = req.db;
    var collection = db.get('tests');
    var ObjectId = require('mongodb').ObjectID;
    var status = {'test_id': '', 'failed': 0, 'passed': 0, 'skipped': 0};
    collection.findOne({'project_id': new ObjectId(req.params.id)},{sort: {_id: -1}},function(e,doc){
        if(doc) {
            status["test_id"] = doc["_id"];
            collection = db.get('results');
            collection.find({'test_id':  new ObjectId(doc["_id"])}, function(e,results) {
                status['total'] = results.length;
                results.forEach(function(result){
                    status[result['result']] += 1;
                });
                requestMods.finishRequest(status, res);
            });
        }
        else {
            requestMods.finishRequest({}, res);
        };
    });
});

// Get history by count
router.get('/:id/history/:count', function(req, res) {
    var ObjectId = require('mongodb').ObjectID;
    testMods.getTests({"project_id": new ObjectId(req.params.id)},{sort: {_id: -1}, limit: req.params.count},req, function(results){
        requestMods.finishRequest(results,res);
    });
});

// Views

// Show Project
router.get('/:id/show', function(req, res) {
    res.render('project',{title: 'Project Detail', id: req.params.id});
});
module.exports = router;

module.exports = router;