// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
import {find_poll_by_id} from './../helpers/db_ops'

async function get_poll(req: Request, res: Response) {
    const poll_id: string = req.params.poll_id
    if (typeof poll_id === 'string') {
        let poll = await find_poll_by_id(poll_id)
        if(poll.length===0){
            return res.sendStatus(404)
        }
        console.log(poll)
        poll=poll[0]
        poll.options=poll.options.map((el: { text: string;votes:number}) => {return {text:el.text} });
        delete (poll._id)
        delete (poll.ips)
        res.json(poll)
    }
}
export default get_poll;