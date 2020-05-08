const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    latestSubmissionID: {
        type: Number,
        required: true,
        default: 1
    }
});

schema.statics.getSettings = function(callback){
    this.findOne({}, callback);
};

schema.statics.getNewSubID = function(callback){
    this.findOneAndUpdate({}, { $inc: { latestSubmissionID :1 } }, {new: true, useFindAndModify: false}, callback);
}

module.exports = mongoose.model('Settings', schema);