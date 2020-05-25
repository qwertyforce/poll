// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
import {find_poll_by_id,vote_by_id,add_ip} from './../helpers/db_ops'

function is_valid_option(checked_option:string,options:any[]){
for (const option of options) {
    if(checked_option===option.text){
        return true
    }
}
return false
}

async function vote (req:Request,res:Response){
    const poll_id: string = req.body.poll_id
    const votes: string[] = req.body.votes
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
    if(poll.ban_tor){
        //check if user is using Tor
    }

    if(votes.length>poll.options.length){ // check if user is trying to vote for more options than there is 
        return res.status(403).json({
            message: "input is too big"
        });
    }

    if ( (req as any).recaptcha.error && poll.require_captcha) {    //(req as any) dirty hack, something is wrong with typings  
        return res.status(403).json({
            message: "Captcha error"
        });
    }

    console.log(poll_id)
    console.log(poll)
    console.log(poll.allow_multiple_answers)

    for (const vote of votes) {
        if(typeof vote!=='string' || !is_valid_option(vote,poll.options)){
            return res.status(403).json({message:'bad input'});
        }
    }

    if(poll.allow_multiple_answers || votes.length===1 ){
        const result=await vote_by_id(poll_id,votes) 
        if(req.session!.voted){
            req.session!.voted.push(poll_id)
            
        }else{
            req.session!.voted=[poll_id]
        }
        if(poll.security_level>1){
            add_ip(poll_id,req.ip)
        }
        res.json(result.value.options)
        console.log(result.value.options)
    }else{
        return res.status(403).json({message:'Multiple answers are not allowed'}); 
    }

}


export default vote;