import React from 'react';
import './App.css';
import axios from 'axios';
import { Layout} from 'antd';
import { Card } from 'antd';
import { Row } from 'antd';
import { Form, Input, Button, Select,Checkbox } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
const {Content, Footer } = Layout;

const { Option } = Select;


function CreatePoll(){

//   const handleLogin = (token) => {
//     let login_data={,'g-recaptcha-response': token}
//     axios("http://localhost/login", {
//       method: "post",
//       data: login_data,
//       withCredentials: true
//     }).then((resp)=>{

//       console.log(resp)
//     }).catch((err)=>{

//     })
//   };
//   const _handleLogin = () => {
//     /*global grecaptcha*/ // defined in public/index.html
//     grecaptcha.ready(function() {
//       grecaptcha.execute('6LcqV9QUAAAAAEybBVr0FWnUnFQmOVxGoQ_Muhtb', {action: 'login'}).then(function(token) {
//         handleLogin(token)
//       });
//       })
// }
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

return(
  <Layout> 
    <Content className="content">
          <Row justify="center">
  
      <Card>
      <Form
      name="basic"
      initialValues={{ captcha: false,fraud_prevention:"cookie_ip",ban_tor:false }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="Question"
        name="question"
        rules={[{ required: true, message: 'Please enter your question!' }]}
      >
        <Input />
      </Form.Item>

      <Form.List name="options">
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  required={false}
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please enter option or delete this field.",
                      },
                    ]}
                    noStyle
                  >
                    <div className="fff">
                    <Input  placeholder={`Option ${(index+1).toString()}`}  />
                    {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                    </div>
                    
                  </Form.Item>
                  
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                style={{width:"100%"}}
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> Add option
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>
      
      <Form.Item name="fraud_prevention" label="Fraud prevention" rules={[{ required: true }]}>
        <Select>
          <Option value="cookie">cookie</Option>
          <Option value="cookie_ip">cookie+ip</Option>
          <Option value="cookie_ip_challenge">cookie+ip+anti bot protection</Option>
        </Select>
      </Form.Item>

      <Form.Item  name="captcha"  style={{margin:0}} valuePropName="checked">
        <Checkbox>Require captcha</Checkbox>
      </Form.Item>

      <Form.Item  name="ban_tor"  valuePropName="checked">
        <Checkbox>Ban Tor user</Checkbox>
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


export default CreatePoll;