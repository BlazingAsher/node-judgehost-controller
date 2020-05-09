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
  Submission.findOne({
    "internalID": req.params["uid"]
  }, function(err, result){
    if(err){
      console.log(err)
      return res.json({
        "status": "ERROR",
        "message": "Error fetching submission status from database."
      })
    }

    let state;

    if(result.judged){
      if(result.compileError){
        state = {
          "state": "Compile error",
          "error": Buffer.from(result.output["output_compile"], 'base64').toString('utf8')
        }
      }
      else{
        let outputLines = Buffer.from(result.output["output_run"], 'base64').toString('utf8').split("\n");
        console.log(outputLines)

        state = {
          "state": "Finished",
          "judge_response": result.output.runresult,
          "runtime": result.output.runtime,
          "output_run": outputLines[outputLines.length-2],
          "output_error": Buffer.from(result.output["output_error"], 'base64').toString('utf8')
        }

      }
    }
    else{
      state = {
        "state": "Awaiting run."
      }
    }

    return res.json({
      "status": "OK",
      "data": state
    })

  })
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
