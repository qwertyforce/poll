// eslint-disable-next-line no-unused-vars
import {Request, Response} from 'express';
import crypto from 'crypto'
import JavaScriptObfuscator from 'javascript-obfuscator';

const SALT="qwfhuiiokjhgfygtyukiomnjhbgfhtrghyukiomjkhbvcfdrtyujiknbvgftyujhnm,lkoiuhgfcxdsertyghnmjkiouyhgcfxdrtyghnm,klijhgvcxdfrtyghjkjnbvcfdrt65789ijkhg"

function randomInteger(min:number, max:number) {
    const rand = min + Math.random() * (max + 1 - min)
    return Math.floor(rand);
}
function generate_challenge() {
    const N = randomInteger(5, 10)
    let arr = []
    for (let i = 0; i < N; i++) {
        arr.push(randomInteger(1, 1000))
    }
    let answer = 1;
    for (let i = 0; i < arr.length; i++) {
        answer *= arr[i]
    }
    let challenge = `function f(){
        const context=Function('return this')()
        const array_of_random_ints=[${arr.toString()}]
        const obj={}
        const fn=obj.toString
        if(undefined!==true&&undefined===obj.x&&context.window&&context.require===undefined&&context.module===undefined&&context.process===undefined&&
            context.global===undefined&&context.setImmediate===undefined&&context.clearImmediate===undefined&&context.Buffer===undefined&&
            context.toString()==="[object Window]"&&context.String(this)==="[object Window]" && fn.call(context)==="[object Window]"){ 
            for (let i = 0; i <array_of_random_ints.length; i++) {
                if(context.String(array_of_random_ints[i])!==array_of_random_ints[i].toString() && 
                    array_of_random_ints[i].toString()!==context.toString(array_of_random_ints[i])){
                    return false
                 }   
            }
            let answer=1;
            for (let i = 0; i <array_of_random_ints.length; i++) {
                answer*=array_of_random_ints[i]
            }
          return answer
        }else{
            return false
        }
    }
    f()`

    const obfuscationResult = JavaScriptObfuscator.obfuscate(challenge,{
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: true,
        shuffleStringArray: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayEncoding: 'base64',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: true
    })
    return {challenge:Buffer.from(obfuscationResult.getObfuscatedCode()).toString('base64'),answer:answer.toString()}
}
function js_challenge (req:Request,res:Response){
    const poll_id: string = req.params.poll_id
    if(typeof poll_id!=="string"){
        return res.status(403).json({
            message: "bad input"
        });
    }
    const {challenge,answer} : { challenge: string; answer: string }=generate_challenge()
    const expire_time=(Math.round(new Date().getTime()/1000)+60).toString()    //1 minute
    const str_to_hash=challenge+expire_time+answer+SALT
    const hash=crypto.createHash('sha256').update(str_to_hash).digest('base64')
    res.json({challenge:challenge,expire_time:expire_time,hash:hash})

}


export default js_challenge;