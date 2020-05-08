const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    timestamp : {
        type: Number,
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
    submissionID: {
        type: Number,
        required: true
    },
    contestID: {
        type: Number,
        required: true
    },
    output: {
        type: String
    }

});

module.exports = mongoose.model('StatEntry', schema);