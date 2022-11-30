import React from 'react';
import { Form, Select, Button } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import { get, setEach } from 'utils/setting';
import { notification } from 'antd/lib/index';

const FormItem = Form.Item;
const Option = Select.Option;

class PostDesign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formLayout: 'horizontal',
      settings: [],
      params: {
        select: 'name,value',
        where: {
          name: ['post_layout'],
        },
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { setFieldsValue } = this.props.form;
    const { params } = this.state;
    let settings = null;

    try {
      let response = await agent.get('/settings').query(params);
      settings = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get post design',
      });
    }

    if (isEmpty(settings)) {
      return null;
    }

    setFieldsValue({
      postLayout: get(settings, 'post_layout'),
    });

    this.setState({
      settings,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { getFieldsValue } = this.props.form;
    const { settings } = this.state;

    let listOfSettings = setEach(settings, getFieldsValue());

    try {
      await agent.put('/settings').send(listOfSettings);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not update post design',
      });
    }
  }

  render() {
    const { formLayout } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
          }
        : null;
    const buttonItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 4, offset: 4 },
          }
        : null;
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Post Design</strong>
          </span>
        </div>
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <FormItem label="Post layout" {...formItemLayout}>
            {getFieldDecorator('postLayout', {
              initialValue: '',
            })(
              <Select placeholder="Choose post layout">
                <Option value="picture-next-standfirst-and-bullet-points">
                  picture next standfirst and bullet points
                </Option>
                <Option value="big-picture-with-standfirst-and-bullet-points">
                  big picture with standfirst and bullet points
                </Option>
              </Select>,
            )}
          </FormItem>
          <FormItem {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(PostDesign);
