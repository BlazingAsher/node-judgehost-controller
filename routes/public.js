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

  submissionAcceptor.createSubmitTemp(subUUID, function(uuid){
    // all submission stuff should have been done now
    console.log("Done!")
    console.log("UUID: "+ uuid);

    // grab the final info
    const finalSubmitInfo = submissionAcceptor.flushTempSubmission(uuid, true);

    if(!finalSubmitInfo["valid"] || finalSubmitInfo["file"] === undefined) {
      console.log("invalid submission");
      return;
    }
    else {
      Submission.create({
        timestamp: Date.now(),
        teamName: finalSubmitInfo["fields"]["team"] || "NOTEAM",
        fileB64: finalSubmitInfo["file"],
        submissionID: finalSubmitInfo["domSID"],
        contestID: finalSubmitInfo["domCID"]
      }, function(res, err){
        if(err){
          submissionAcceptor.handleError(uuid)(err);
        }
        else{
          submissionAcceptor.setSubmitted(uuid);
        }

      })
    }

  })

  form.onPart = function(part) {
    // let formidable handle only non-file parts
    if (part.filename === '' || !part.mime) {
      // used internally, please do not override!
      form.handlePart(part);
    }
    else {
      part.on('error', submissionAcceptor.handleError(subUUID));
      part.pipe(concat(submissionAcceptor.acceptFile(subUUID)));
    }
  };

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    //res.json({ fields, files });
    submissionAcceptor.addSubmissionData(subUUID, "fields", fields);
    res.json({"status": "OK", "subID": subUUID})
  });
})

module.exports = router;
