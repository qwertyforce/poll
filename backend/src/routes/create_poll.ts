// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
import {create_new_poll} from './../helpers/db_ops'

async function create_poll(req: Request, res: Response) {
    const security_level: string = req.body.security_level
    const question: string = req.body.question
    const require_captcha: Boolean = req.body.require_captcha
    const ban_tor: Boolean = req.body.ban_tor
    const allow_multiple_answers: Boolean = req.body.allow_multiple_answers
    if (typeof security_level === 'string' &&
        typeof question === 'string' &&
        typeof require_captcha === 'boolean' &&
        typeof ban_tor === 'boolean' &&
        typeof allow_multiple_answers === 'boolean' &&
        Array.isArray(req.body.options) &&
        req.body.options.length>0) {
        let options=[]
        for (let i = 0; i < req.body.options.length; i++) {
            if (typeof req.body.options[i] === "string") {
                options.push({text: req.body.options[i], votes: 0 })
            } else {
                return res.sendStatus(403)
            }
        }
        const poll_id = await create_new_poll(question, options,security_level, require_captcha, ban_tor,allow_multiple_answers)
        res.send(poll_id)
    }else{
        res.sendStatus(403)
    }
}

export default create_poll;