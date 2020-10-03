import React from 'react';
import './App.css';
import axios from 'axios';
import { Layout, Alert} from 'antd';
import { Card } from 'antd';
import { Row } from 'antd';
import { Typography } from 'antd';
import { Form, Button,Checkbox } from 'antd';
import { Radio} from 'antd';

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';


import {useParams} from "react-router-dom";
import config from './config'
const { Title } = Typography;
const {Content, Footer } = Layout;


const SERVER_URL=config.domain


const checkbox_radio_style = {
  display: 'block',
  marginLeft: 0,
  height: '30px',
  lineHeight: '30px',
};



function Poll(){
  const [question, setQuestion] = React.useState();
  const [options, setOptions] = React.useState<any[]>();
  const [multiple_choice, setMultipleChoice] = React.useState();
  const [require_captcha, setRequireCaptcha] = React.useState();
  const [js_challenge, setJsChallenge] = React.useState(false);
  const [loading_text, setLoadingText] = React.useState("loading");
  let { id } = useParams();
  const vote_props={
    question:question,
    options:options,
    setOptions:setOptions,
    multiple_choice:multiple_choice,
    js_challenge:js_challenge,
    require_captcha:require_captcha,
    id:id
  }
  const results_props={
    question:question,
    options:options
  }
  React.useEffect(()=>{
    axios(`${SERVER_URL}/get_poll/${id}`, {
      method: "get",withCredentials: true
    }).then((resp)=>{
      setJsChallenge(resp.data.security_level>2)
      setRequireCaptcha(resp.data.require_captcha)
      setOptions(resp.data.options)
      setQuestion(resp.data.question)
      setMultipleChoice(resp.data.allow_multiple_answers)
      console.log(resp)
    }).catch((err)=>{
      setLoadingText("poll does not exist")
       console.log(err)
    })
  },[id])

  return (
    <Layout>
      <Content className="content">
        <Row justify="center">
            {(options)?((options[0].votes===undefined) ? (    //if not voted
              <Vote {...vote_props} />
            ) : (
                <Poll2 {...results_props}/>
              )):
            (<div>{loading_text}</div>)

            }
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Created by qwertyforce</Footer>
    </Layout>
  )
}

function Vote(props:any){
  const [alert_visible, setAlertVisible] = React.useState(false);
  const [error_text, setErrorText] = React.useState("");

  const _vote = (token: string, values: any) => {
    console.log(props.js_challenge)
    if (props.js_challenge) {
      axios(`${SERVER_URL}/get_challenge/${props.id}`, {
        withCredentials: true
      }).then((resp) => {
        console.log(resp.data)
        // eslint-disable-next-line no-eval
        resp.data.answer=(eval.call(window,atob(resp.data.challenge))).toString()
        vote(token,values,resp.data)
      }).catch((err) => {
      setErrorText("js challenge error")
      setAlertVisible(true)
      })
    } else {
      vote(token, values, 0)
    }
  }

  const vote = (token:string,values:any,js_challenge:any) => {
    let data={
      poll_id:props.id,
      votes:values.choices,
      'g-recaptcha-response': token,
      js_challenge:js_challenge
    }
    if(!Array.isArray(data.votes)){data.votes=[data.votes]}
    axios(`${SERVER_URL}/vote`, {
      method: "post",
      data: data,
      withCredentials: true
    }).then((resp) => {
      props.setOptions(resp.data)
      console.log(resp)
    }).catch((err) => {
      setErrorText(err.response.data.message)
      setAlertVisible(true)
      console.log(err)
    })
  }

  const __vote = (values:any) => {
    if (props.require_captcha) {
      grecaptcha.ready(function () {
        grecaptcha.execute(config.recaptcha_site_key, { action: 'vote' }).then(function (token: string) {
          _vote(token, values)
        });
      })
    } else {
      _vote("", values)
    } 
}
  const onFinish = (values: any) => {    
    __vote(values)
    console.log('Success:', values);
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  }

return(  
  <Card>
    <Title level={4}>{props.question}</Title>
<Form
  name="basic"
  onFinish={onFinish}
  onFinishFailed={onFinishFailed}
>
  <Form.Item name="choices" rules={[{ required: true, message: 'You must select an option.' }]}>
    {props.multiple_choice&&(props.options)? (
      <Checkbox.Group >
                {props.options.map((option:any, index:string) => (
                  <Checkbox style={checkbox_radio_style} key={index} value={index}>
                   {option.text}
                  </Checkbox>
                ))}
      </Checkbox.Group>

    ) : (

        <Radio.Group>
           {props.options.map((option:any, index:string) => (
                  <Radio style={checkbox_radio_style} key={index} value={index}>
                    {option.text}
                   </Radio>

                ))}
        </Radio.Group>

      )
    }
  </Form.Item>
  <div>
      {alert_visible ? (
        <Alert message={error_text} type="error" style={{marginBottom:"20px"}} showIcon />
      ) : null}
    </div>
  <Form.Item className="submit_btn">
    <Button type="primary" htmlType="submit">
      Vote
</Button>
  </Form.Item>
</Form>
  </Card>
)
}


function Poll2(props:any){
  return(
    <Card  bodyStyle={{width:"300px",height:"300px",padding: "0",maxWidth:"80vw",marginTop: "5px",marginBottom:"5px"}} >
    <Title level={4} style={{textAlign:'center'}}>{props.question}</Title>
    <ResponsiveContainer  width={'90%'} height={'90%'}>
    <BarChart 
  data={props.options} 
  layout="vertical"
 
>
  <XAxis type="number"/>
  <YAxis interval={0} type="category" dataKey="text" />
  <CartesianGrid strokeDasharray="3 3"/>
  <Tooltip />
  <Bar dataKey="votes" fill="#82ca9d" />
</BarChart>
    </ResponsiveContainer>
</Card>
  )
}

export default Poll;