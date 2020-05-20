// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
function get_poll_stats (req:Request,res:Response){
	if (req.session!==undefined && req.session.authed !== undefined) {
        res.send('<p>You are logged in! You can see you profile</p><div><a href="/logout">Logout</a></div>')
    } else {
        res.redirect('/login')
    }
}

export default get_poll_stats;