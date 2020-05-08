const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    timestamp : {
        type: Number,
        required: true
    },
    internalID: {
        type: String,
        required: true
    },
    teamName: {
        type: String,
        required: true
    },
    fileB64: {
        type: String,
        required: true
    },
    judged: {
        type: Boolean,
        required: true,
        default: false
    },
    compileError: {
        type: Boolean,
        required: true,
        default: false
    },
    submissionID: {
        type: Number,
        required: true
    },
    contestID: {
        type: Number,
        required: true
    },
    output: {
        type: Object
    }

});

schema.statics.getNextUnjudged = function(callback){
    this.findOne({judged: false}, {submissionID: 1}, callback)
}

module.exports = mongoose.model('Submission', schema);