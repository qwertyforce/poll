import React from 'react';
import './App.css';
import axios from 'axios';
import { Layout} from 'antd';
import { Card } from 'antd';
import { Row } from 'antd';
import { Typography } from 'antd';
import { Form, Input, Button, Select,Checkbox } from 'antd';
import { Radio} from 'antd';

import {useParams} from "react-router-dom";
const { Title } = Typography;
const {Content, Footer } = Layout;

const { Option } = Select;

const checkbox_radio_style = {
  display: 'block',
  marginLeft: 0,
  height: '30px',
  lineHeight: '30px',
};



function Poll(){
  const [question, setQuestion] = React.useState();
  const [options, setOptions] = React.useState<any[]>([]);
  const [multiple_choice, setMultipleChoice] = React.useState();
  let { id } = useParams();

  React.useEffect(()=>{
    axios(`http://localhost/get_poll/${id}`, {
      method: "get"
    }).then((resp)=>{
      setOptions(resp.data.options)
      setQuestion(resp.data.question)
      setMultipleChoice(resp.data.allow_multiple_answers)
      console.log(resp)
    }).catch((err)=>{
       console.log(err)
    })
  },[id])


  const vote = (token:string,values:any) => {
    let data={
      poll_id:id,
      votes:values.choices,
      'g-recaptcha-response': token
    }
    if(!Array.isArray(data.votes)){data.votes=[data.votes]}
    axios("http://localhost/vote", {
      method: "post",
      data: data,
      withCredentials: true
    }).then((resp) => {
      console.log(resp)
    }).catch((err) => {

    })
  };
  const _vote = (values:any) => {
    grecaptcha.ready(function() {
      grecaptcha.execute('6LcqV9QUAAAAAEybBVr0FWnUnFQmOVxGoQ_Muhtb', {action: 'login'}).then(function(token:string) {
        vote(token,values)
      });
      })
}
  const onFinish = (values: any) => {    
    _vote(values)
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout>
      <Content className="content">
        <Row justify="center">
          <Card>
            <Title level={4}>{question}</Title>
            <Form
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item name="choices" rules={[{ required: true, message: 'You must select an option.' }]}>
                {multiple_choice&&(options)? (
                  <Checkbox.Group >
                            {options.map((option, index) => (
                              <Checkbox style={checkbox_radio_style} key={index} value={option.text}>
                               {option.text}
                              </Checkbox>
                            ))}
                  </Checkbox.Group>

                ) : (

                    <Radio.Group>
                       {options.map((option, index) => (
                              <Radio style={checkbox_radio_style} key={index} value={option.text}>
                                {option.text}
                               </Radio>

                            ))}
                    </Radio.Group>

                  )
                }
              </Form.Item>

              <Form.Item className="submit_btn">
                <Button type="primary" htmlType="submit">
                  Create Poll
        </Button>
              </Form.Item>
            </Form>
          </Card>

        </Row>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Created by qwertyforce</Footer>
    </Layout>
  )
}


export default Poll;