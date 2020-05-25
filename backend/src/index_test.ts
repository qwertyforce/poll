import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const MongoStore = require('connect-mongo')(session);
import rateLimit from "express-rate-limit";
import cors from 'cors';
import https from 'https';
import path from 'path';
const Recaptcha = require('express-recaptcha').RecaptchaV3;
import fs from 'fs';

const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
const recaptcha = new Recaptcha('6LcqV9QUAAAAAEybBVr0FWnUnFQmOVxGoQ_Muhtb', '6LcqV9QUAAAAAOA18kbCEWRBhF4g4LjSTaFRVe9P');
app.use(limiter);
app.use(function (req, res, next) {
  res.setHeader('X-Content-Type-Options', "nosniff")
  res.setHeader('X-Frame-Options', "Deny")  //clickjacking protection
  next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.disable('x-powered-by');
app.use(cookieParser());
app.use(session({
    secret: 'ghuieorifigyfuu9u3i45jtr73490548t7ht',
    resave: false,
    saveUninitialized: true,
    name: "session",
    cookie: {      
        maxAge: 14 * 24 * 60 * 60 * 1000,              //use secure: true   
        sameSite: 'lax'
    },
    store: new MongoStore({
        url: 'mongodb://localhost/user_data',
        ttl: 14 * 24 * 60 * 60
    }) // = 14 days. Default 
}))


import get_poll from './routes/get_poll';
import create_poll from './routes/create_poll';
import vote from './routes/vote';
import js_challenge from './routes/js_challenge';


app.get('/get_poll/:poll_id/', [
    // recaptcha.middleware.verify
    ],get_poll)

app.post('/create_poll', [
    // recaptcha.middleware.verify
], create_poll)
    
app.post('/vote', [
    recaptcha.middleware.verify
], vote)

app.post('/get_challenge', [
    // recaptcha.middleware.verify
], js_challenge)

module.exports=app