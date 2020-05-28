// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
import {find_poll_by_id,vote_by_id,add_ip} from './../helpers/db_ops'
import crypto from 'crypto'
const IsTorExit = require("istorexit");
const SALT="qwfhuiiokjhgfygtyukiomnjhbgfhtrghyukiomjkhbvcfdrtyujiknbvgftyujhnm,lkoiuhgfcxdsertyghnmjkiouyhgcfxdrtyghnm,klijhgvcxdfrtyghjkjnbvcfdrt65789ijkhg"


async function vote (req:Request,res:Response){
    const poll_id: string = req.body.poll_id
    const votes: number[] = req.body.votes
    const js_challenge:any=req.body.js_challenge
    if(typeof poll_id!=="string" || !Array.isArray(votes)){
        return res.status(403).json({
            message: "bad input"
        });
    }
    if (req.session && req.session.voted && req.session.voted.includes(poll_id)) {
        return res.status(403).json({
            message: "already voted (cookie)"
        })
    }
    const poll=(await find_poll_by_id(poll_id))[0]
    if(!poll){
        return res.status(404).json({
            message: "poll not found"
        })
    }

    if(poll.security_level>1 && poll.ips.includes(req.ip)){
        return res.status(403).json({
            message: "already voted (ip)"
        })
    }
    if (poll.security_level > 2) {
        if (typeof js_challenge === "object" &&
            typeof js_challenge.challenge === "string" &&
            typeof js_challenge.answer === "string" &&
            typeof js_challenge.expire_time === "string" &&
            typeof js_challenge.hash === "string") {
            if (js_challenge.expire_time > Math.round(new Date().getTime() / 1000)) { //if not expired
                const str_to_hash = js_challenge.challenge + js_challenge.expire_time+ js_challenge.answer + SALT
                const hash = crypto.createHash('sha256').update(str_to_hash).digest('base64')
                if (js_challenge.hash !== hash) {
                    return res.status(403).json({
                        message: "wrong answer"
                    });
                }
            } else {
                return res.status(403).json({
                    message: "challenge has expired"
                });
            }
        } else {
            return res.status(403).json({
                message: "challenge incorrect input"
            });
        }
    }

    if(poll.ban_tor){
        let ip = req.ip
        if (ip.substr(0, 7) === "::ffff:") {
            ip = ip.substr(7)
        }
        if(await IsTorExit(ip)){
            return res.status(403).json({
                message: "Tor is not allowed"
            }); 
        }
    }

    if(votes.length>poll.options.length){ // check if user is trying to vote for more options than there is 
        return res.status(403).json({
            message: "input is too big"
        });
    }

    if (poll.require_captcha && ((req as any).recaptcha.error || (req as any).recaptcha.data.score<0.5)) {    //(req as any) dirty hack, something is wrong with typings  
        return res.status(403).json({
            message: "Captcha error"
        });
    }

    for (const vote of votes) {
        if(typeof vote!=='number' || vote>poll.options.length-1){
            return res.status(403).json({message:'bad votes input'});
        }
    }

    if(poll.allow_multiple_answers || votes.length===1 ){
        const result=await vote_by_id(poll_id,votes) 
        if(req.session!.voted){ //if voted array exists
            req.session!.voted.push(poll_id)
            
        }else{
            req.session!.voted=[poll_id]
        }
        if(poll.security_level>1){
            add_ip(poll_id,req.ip)
        }
        res.json(result.value.options)
    }else{
        return res.status(403).json({message:'Multiple answers are not allowed'}); 
    }

}


export default vote;