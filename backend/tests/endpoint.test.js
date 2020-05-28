/* eslint-disable no-undef */
const request = require('supertest')
const app = require('../dist/index_test') 

describe('Post Endpoints', () => {
  let new_poll_id;
  
  afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  });

  it('/create_poll should give 403 if input is incorrect ', async () => {
    const res = await request(app)
      .post('/create_poll')
      .send({
        security_level:'1',
        question:'test',
        require_captcha:true,
        ban_tor:false,
        allow_multiple_answers:true,
        options:["1","2",3] 
      })
    expect(res.statusCode).toEqual(403)
  })

  it(' /create_poll should give 200 and poll_id if input is correct ', async () => {
    const res = await request(app)
      .post('/create_poll')
      .send({
        security_level:'1',
        question:'test',
        require_captcha:true,
        ban_tor:false,
        allow_multiple_answers:true,
        options:["1","2","3"] 
      })
    expect(typeof res.text).toBe("string")
    new_poll_id=res.text
    expect(res.statusCode).toEqual(200)   
  })
  it('/get_poll should give 404 if poll is not found', async () => {
    const res = await request(app)
      .get(`/get_poll/1`)
    expect(res.statusCode).toEqual(404)   
  })
  it('/get_poll should give 200 and poll data if poll is found', async () => {
    const res = await request(app)
      .get(`/get_poll/${new_poll_id}`)
    expect(res.body).toStrictEqual({"allow_multiple_answers": true,security_level:'1',"question":"test","require_captcha":true,"options":[{"text":"1"},{"text":"2"},{"text":"3"}]})
    expect(res.statusCode).toEqual(200)   
  })

  it('/vote should give 403 if input is incorrect', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:1,
      votes:"123"
    })
    expect(res.body).toStrictEqual({ message: 'bad input' }) 
    expect(res.statusCode).toEqual(403)   
  })
  it('/vote should give 404 if poll is not found', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:'1',
      votes:["option"]
    })
    expect(res.body).toStrictEqual({ message: 'poll not found' }) 
    expect(res.statusCode).toEqual(404)   
  })
  
  it('/vote should give 403 if user is trying to vote for more options than there is ', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:new_poll_id,
      votes:[1,2,3,4,5,6]
    })
    expect(res.body).toStrictEqual({ message: "input is too big" }) 
    expect(res.statusCode).toEqual(403)   
  })

  it('/vote should give 403 if captcha is required, but wrong captcha sent', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:new_poll_id,
      votes:[1,3]
    })
    expect(res.body).toStrictEqual({  message: "Captcha error" }) 
    expect(res.statusCode).toEqual(403)   
  })
  
  it(' create poll without captcha for further testing ', async () => {
    const res = await request(app)
      .post('/create_poll')
      .send({
        security_level:'2',
        question:'test',
        require_captcha:false,
        ban_tor:false,
        allow_multiple_answers:true,
        options:["1","2","3"] 
      })
    new_poll_id=res.text
    expect(res.statusCode).toEqual(200)   
  })

  it('/vote should give 403 if votes array is incorrect', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:new_poll_id,
      votes:[1,3]     //option 3 doesn't exists     [0,1,2]
    })
    expect(res.body).toStrictEqual({message:'bad votes input'}) 
    expect(res.statusCode).toEqual(403)   
  })
  
  let cookie
  it('/vote should give 200 and results if everything is OK ', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:new_poll_id,
      votes:[0,2]     
    })
    cookie=res.headers['set-cookie'][0]
    expect(res.body).toStrictEqual([{"id": 0, "text": "1", "votes": 1}, {"id": 1, "text": "2", "votes": 0}, {"id": 2, "text": "3", "votes": 1}]) 
    expect(res.statusCode).toEqual(200)   
  })

  it('/vote should give 403 if your cookie is already voted', async () => {
    const res = await request(app)
    .post('/vote').set('Cookie', cookie)
    .send({
      poll_id:new_poll_id,
      votes:[0,2]     
    })
    expect(res.body).toStrictEqual({"message": "already voted (cookie)"}) 
    expect(res.statusCode).toEqual(403)   
  })

  it('/vote should give 403 if your ip is already voted', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:new_poll_id,
      votes:[0,2]     
    })
    expect(res.body).toStrictEqual({"message": "already voted (ip)"}) 
    expect(res.statusCode).toEqual(403)   
  })

  it('/get_poll should give 200 and poll results if you already voted', async () => {
    const res = await request(app)
      .get(`/get_poll/${new_poll_id}`)
    expect(res.body).toStrictEqual({question: "test",options:[{"id": 0, "text": "1", "votes": 1}, {"id": 1, "text": "2", "votes": 0}, {"id": 2, "text": "3", "votes": 1}]})
    expect(res.statusCode).toEqual(200)   
  })

  it('/get_challenge should give 200 and challenge', async () => {
    const res = await request(app)
      .get(`/get_challenge/${new_poll_id}`)
    expect(res.body).toStrictEqual(expect.objectContaining({
      challenge: expect.any(String),
      expire_time: expect.any(String),
      hash: expect.any(String)
    }))
    expect(res.statusCode).toEqual(200)   
  })
  
  it(' create poll without captcha and without allowing multiple answers for further testing ', async () => {
    const res = await request(app)
      .post('/create_poll')
      .send({
        security_level:'2',
        question:'test',
        require_captcha:false,
        ban_tor:false,
        allow_multiple_answers:false,
        options:["1","2","3"] 
      })
    new_poll_id=res.text
    expect(res.statusCode).toEqual(200)   
  })
  
  it('/vote should give 403 if you try to vote for multiple options, when it is forbidden', async () => {
    const res = await request(app)
    .post('/vote')
    .send({
      poll_id:new_poll_id,
      votes:[0,2]     
    })
    expect(res.body).toStrictEqual({message:'Multiple answers are not allowed'}) 
    expect(res.statusCode).toEqual(403)   
  })


})
 


 