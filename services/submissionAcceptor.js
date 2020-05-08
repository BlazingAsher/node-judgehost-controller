let SubmissionAcceptor = {}

let submissionTemp = {};
let submitMapper = {};

let contestID = Math.round(Date.now() / 10000);
let subID = Math.round(Math.random() * 134);

function cleanupTemp(){
    for(let subID of Object.keys(submissionTemp)){
        // auto flush dangling submissions
        if(Date.now() - submissionTemp[subID]["started"] > 60 && (!submissionTemp[id]["submitted"] || submissionTemp[id]["retrieved"])){
            delete submissionTemp[subID];
        }
    }
}

SubmissionAcceptor.acceptFile = function(id) {
    return function(data) {
        console.log(id);
        console.log("accepted file");
        //console.log(data.toString('base64'))
        SubmissionAcceptor.addSubmissionData(id, "file", data.toString('base64'))
    }
}

SubmissionAcceptor.handleError = function(id){
    return function(err){
        submissionTemp[id]["valid"] = false;
        submissionTemp[id]["error"] = err.toString();
    }
}

SubmissionAcceptor.createSubmitTemp = function(id, submissionDoneCallback){
    submissionTemp[id] = {}
    submissionTemp[id]["domSID"] = subID++;
    submissionTemp[id]["domCID"] = contestID;
    submissionTemp[id]["callback"] = submissionDoneCallback;
    submissionTemp[id]["started"] = Date.now();
    submissionTemp[id]["valid"] = true;
    submissionTemp[id]["submitted"] = false;
    submissionTemp[id]["finished"] = false;
    submissionTemp[id]["retrieved"] = false;
    submissionTemp[id]["output"] = "";

    submitMapper[contestID + "-" + submissionTemp[id]["domSID"]] = id;
}

SubmissionAcceptor.addSubmissionData = function(id, name, data){
    submissionTemp[id][name] = data

    if(submissionTemp[id]["fields"] !== undefined && submissionTemp[id]["file"] !== undefined){
        submissionTemp[id]["callback"](id);
    }
}

SubmissionAcceptor.setSubmitted = function(id){
    submissionTemp[id]["submitted"] = true;
}

SubmissionAcceptor.delieverResult = function(cid, sid, data){
    let id = submitMapper[cid + "-" + sid];
    submissionTemp[id]["finished"] = true;
    submissionTemp[id]["output"] = data;
}

SubmissionAcceptor.setRetrieved = function(id){
    submissionTemp[id]["retrieved"] = true;
}

SubmissionAcceptor.flushTempSubmission = function(id, keep = false){
    let submissionInfo = submissionTemp[id];
    console.log(id)
    //console.log(submissionTemp);
    if(!keep){
        console.log("deleting " + id)
        delete submissionTemp[id];
    }

    return submissionInfo;
}

SubmissionAcceptor.startCleanupJob = function(){
    setInterval(cleanupTemp, 30000)
}

module.exports = SubmissionAcceptor;