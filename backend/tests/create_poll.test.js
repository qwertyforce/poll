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
    expect(res.body).toStrictEqual({"question":"test","require_captcha":true,"options":[{"text":"1"},{"text":"2"},{"text":"3"}]})
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



})
 


 