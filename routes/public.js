const express = require('express');
const router = express.Router();

const submissionAcceptor = require('../services/submissionAcceptor');

const { v4: uuidv4 } = require('uuid');

const concat = require('concat-stream');
const formidable = require('formidable');

const Submission = require('../models/Submission');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/status/:uid', function(req, res, next){
  const tempSubmitInfo = submissionAcceptor.flushTempSubmission(req.params.uid, true);
  if(!tempSubmitInfo["valid"]){
    return res.json({
      "status": "ERROR",
      "message": "There was an error processing your submission. Please try again.",
      "error": tempSubmitInfo
    })
  }
  else if (tempSubmitInfo["file"] === undefined){
    return res.json({
      "status": "ERROR",
      "message": "No submission file detected. Did you submit a file?"
    })
  }
  else if(tempSubmitInfo["submitted"]){
    return res.json({
      "status": "OK",
      "message": "Submitted to machine. Awaiting results."
    })
  }
  else if(tempSubmitInfo["finished"]){


    return res.json({
      "status": "OK",
      "message": "Judged",
      "output": tempSubmitInfo["output"]
    })
  }
  else{
    return res.json({
      "status": "OK",
      "data": tempSubmitInfo
    })
  }
})

router.post('/submit', function(req, res, next){
  const form = formidable();

  const subUUID = uuidv4();

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    if(Object.keys(files).length === 0 || Object.keys(fields).length === 0){
      return res.json({
        "status": "ERROR",
        "message": "You are missing data from your submission."
      })
    }
    submissionAcceptor.addSubmissionData(subUUID, fields, files);
    res.json({"status": "OK", "subID": subUUID})
  });
})

module.exports = router;
