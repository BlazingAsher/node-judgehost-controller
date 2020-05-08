require('dotenv').config()

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const basicAuth = require('express-basic-auth')

const mongoose = require('mongoose');
const database = process.env.DATABASE || 'mongodb://localhost:27017';

const apiRouter = require('./routes/api');
const publicRouter = require('./routes/public');

const rateLimit = require("express-rate-limit");

const scriptPacker = require('./services/scriptPacker');

scriptPacker.loadScripts();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 1 // limit each IP to 100 requests per windowMs
});

if(process.env.ENV !== 'development'){
    app.use('/public', limiter);
}

app.use('/api/v4', basicAuth({
    users: {
        'judgehost': process.env.JUDGEHOST_API_PASSWORD
    }
}))
app.use('/api/v4', apiRouter);

app.use('/public', publicRouter);

mongoose.connect(database, {server: {auto_reconnect: true}})
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch(error => {
        console.log("DB CONNECTION ERROR");
        console.log(error)
    });

module.exports = app;
