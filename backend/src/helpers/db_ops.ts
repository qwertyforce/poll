var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/';
import crypto from "crypto"
var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
const db_main = 'user_data';
const client = new MongoClient(url, options);
client.connect(function(err: any) {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected successfully to db server");
    }
});

async function findDocuments(collection_name:string, selector:object) {
    const collection = client.db(db_main).collection(collection_name);
    let result = collection.find(selector).toArray()
    return result
}
async function removeDocument(collection_name:string, selector:object) {
    const collection = client.db(db_main).collection(collection_name);
    collection.deleteOne(selector)
}

async function insertDocuments(collection_name:string, documents:Object[]) {
    const collection = client.db(db_main).collection(collection_name);
    collection.insertMany(documents)
    // let result = await collection.insertMany(documents);
    // return result
}
async function updateDocument(collection_name:string,selector:object,update:object) {
  const collection = client.db(db_main).collection(collection_name);
  collection.updateOne(selector, { $set: update })
  // let result= await collection.updateOne(selector, { $set: update })
}

async function addToArrayInDocument(collection_name:string,selector:object,update:object) {
    const collection = client.db(db_main).collection(collection_name);
    collection.updateOne(selector, { $push: update })
  }

async function generate_id() {
    const id = new Promise((resolve, reject) => {
        crypto.randomBytes(32, async function(ex, buffer) {
            if (ex) {
                reject("error");
            }
            let id = buffer.toString("base64")
            let users = await find_poll_by_id(id) //check if id exists
            if (users.length === 0) {
                resolve(id);
            } else {
                let id_1 = await generate_id()
                resolve(id_1)
            }
        });
    });
    return id;
}

export async function find_poll_by_id(id:string) {
    let poll = findDocuments("polls", {
        id: id
    })
    return poll
}

export async function create_new_poll(question:string,options:Object[],security_level:string,require_captcha:Boolean,ban_tor:Boolean) {
    let id=await generate_id()
    insertDocuments("polls", [{
        id:id,
        question: question,
        options:options,
        security_level:security_level,
        require_captcha:require_captcha,
        ban_tor:ban_tor,
        ips:[]
    }])
    return id
}

export async function vote(poll_id:string,options_id:string) {
    const collection = client.db(db_main).collection("poll");
    let result =collection.updateOne({id: poll_id,"options.id":options_id}, { $inc: { numbers: 1}})
    return result
}

export async function add_ip(poll_id:string,ip:string) {
    addToArrayInDocument("polls",{id: poll_id},{ips:ip})
}

 