import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const MongoStore = require('connect-mongo')(session);
import rateLimit from "express-rate-limit";
import cors from 'cors';
const Recaptcha = require('express-recaptcha').RecaptchaV3;
import config from '../../config/config'
const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
const recaptcha = new Recaptcha(config.recaptcha_site_key,config.recaptcha_secret_key);
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
const cors_options={
    "origin": "http://localhost:3000",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "credentials":true,
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }
app.use(cors(cors_options));
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
        url: config.mongodb_url+ 'poll',
        ttl: 14 * 24 * 60 * 60
    }) // = 14 days. Default 
}))

const port = 80;
app.listen(port, () => { //Uncomment if you want to use http
    console.log(`Server is listening on port ${port}`);
});

//  const server = https.createServer({
//       key: fs.readFileSync('privkey.pem'),
//       cert: fs.readFileSync('cert.pem')
//     }, app).listen(port);

// setInterval(function () {server.setSecureContext({
//     cert: fs.readFileSync('cert.pem', 'utf8'),//fullchain
//     key: fs.readFileSync('privkey.pem', 'utf8')
//   })},86400000)

// console.log(`Server is listening on port ${port}`);

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

app.get('/get_challenge/:poll_id/', [
    // recaptcha.middleware.verify
], js_challenge)

