"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var express_session_1 = __importDefault(require("express-session"));
var MongoStore = require('connect-mongo')(express_session_1.default);
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var cors_1 = __importDefault(require("cors"));
var Recaptcha = require('express-recaptcha').RecaptchaV3;
var app = express_1.default();
var limiter = express_rate_limit_1.default({
    windowMs: 15 * 60 * 1000,
    max: 100 // limit each IP to 100 requests per windowMs
});
var recaptcha = new Recaptcha('6LcqV9QUAAAAAEybBVr0FWnUnFQmOVxGoQ_Muhtb', '6LcqV9QUAAAAAOA18kbCEWRBhF4g4LjSTaFRVe9P');
app.use(limiter);
app.use(function (req, res, next) {
    res.setHeader('X-Content-Type-Options', "nosniff");
    res.setHeader('X-Frame-Options', "Deny"); //clickjacking protection
    next();
});
app.use(body_parser_1.default.urlencoded({
    extended: true
}));
app.use(body_parser_1.default.json());
app.use(cors_1.default());
app.disable('x-powered-by');
app.use(cookie_parser_1.default());
app.use(express_session_1.default({
    secret: 'ghuieorifigyfuu9u3i45jtr73490548t7ht',
    resave: false,
    saveUninitialized: true,
    name: "session",
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    },
    store: new MongoStore({
        url: 'mongodb://localhost/user_data',
        ttl: 14 * 24 * 60 * 60
    }) // = 14 days. Default 
}));
var port = 80;
app.listen(port, function () {
    console.log("Server is listening on port " + port);
});
//  https.createServer({
//       key: fs.readFileSync('privkey.pem'),
//       cert: fs.readFileSync('cert.pem')
//     }, app).listen(port);
// console.log(`Server is listening on port ${port}`);
var get_poll_stats_1 = __importDefault(require("./routes/get_poll_stats"));
var create_poll_1 = __importDefault(require("./routes/create_poll"));
var vote_1 = __importDefault(require("./routes/vote"));
var js_challenge_1 = __importDefault(require("./routes/js_challenge"));
app.get('/poll/:poll_id/', [
// recaptcha.middleware.verify
], get_poll_stats_1.default);
app.post('/create_poll', [
    recaptcha.middleware.verify
], create_poll_1.default);
app.post('/poll/:poll_id/', [
    recaptcha.middleware.verify
], vote_1.default);
app.post('/get_challenge', [
    recaptcha.middleware.verify
], js_challenge_1.default);
