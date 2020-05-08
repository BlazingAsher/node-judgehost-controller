let SubmissionAcceptor = {}

const fs = require('fs');
const path = require('path');

const Settings = require('../models/Settings');

let Submission = require('../models/Submission');

let submissionTemp = {};

let contestID = 5;

SubmissionAcceptor.flushTempSubmission = function(id, keep = false){
    let submissionInfo = submissionTemp[id];
    if(!keep){
        console.log("deleting " + id)
        delete submissionTemp[id];
    }

    return submissionInfo;
}

SubmissionAcceptor.addSubmissionData = function (id, fields, files){
    let fileBuffer = fs.readFileSync(files["program"]["path"]);

    Settings.getNewSubID(function(err, res){
        if(err || !res){
            console.log(err)
        }
        let subID = res.latestSubmissionID;

        Submission.create({
            "timestamp": Date.now(),
            "internalID": id,
            "teamName": fields["team"] || "NOTEAM",
            "fileB64": fileBuffer.toString('base64'),
            "contestID": contestID,
            "submissionID": subID
        }, function(err2, res2){
            if(err2) {
                console.log(err2);
            }
        })
    })
}

SubmissionAcceptor.deliverResult = function (subid, result, callback, compileError = false){
    Submission.findOneAndUpdate({
        "submissionID": subid
    },{
        "$set": {
            "output": result,
            "judged": true,
            "compileError": compileError
        }
    }, {useFindAndModify: false}, callback)
}

module.exports = SubmissionAcceptor;