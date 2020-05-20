"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vote(req, res) {
    if (req.session !== undefined && req.session.authed !== undefined) {
        res.send('<p>You are logged in! You can see you profile</p><div><a href="/logout">Logout</a></div>');
    }
    else {
        res.redirect('/login');
    }
}
exports.default = vote;