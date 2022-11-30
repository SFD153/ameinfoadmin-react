import React from 'react';
import { Form, Input, Button, Select, Checkbox } from 'antd';
import { Col, Row } from 'antd';
import agent from 'utils/agent';
import { notification } from 'antd/lib/index';
import { push } from 'react-router-redux';
import { dispatch } from 'stores';
import { getMeta } from 'utils/ad';
import { getOption } from 'utils/ad';
import cn from 'classnames';
import isEmtpy from 'lodash/isEmpty';
import get from 'lodash/get';
import capitalize from 'lodash/capitalize';
import Title from 'components/DashboardComponents/Title';
import SubTitle from 'components/DashboardComponents/SubTitle';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class EditOrAddNewAd extends React.Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      formLayout: 'horizontal',
      placements: [],
    };

    this.state = this.INITIAL_STATE;

    this.handleFormLayoutChange = this.handleFormLayoutChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleChangeSelectedCategories = this.handleChangeSelectedCategories.bind(this);
    this.handleChangeSelectedSubCategories = this.handleChangeSelectedSubCategories.bind(this);
  }

  async componentDidUpdate(prevProps) {
    // Set state to default if page is add new
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.props.form.resetFields();
      this.setState(this.INITIAL_STATE);
    }
  }

  async componentDidMount() {
    const id = this.props.match.params.id;
    await this.fetchDefaultData();
    if (!isEmtpy(id)) {
      await this.fetchDataById();
    }
  }

  async fetchDefaultData() {
    let placements = [];

    try {
      let response = await agent.get('/ads/placement');
      placements = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of categories',
      });
    }

    this.setState({ placements });
  }

  getPlacementName(slug) {
    return capitalize(slug.split('-').join(' '));
  }

  async fetchDataById() {
    const id = this.props.match.params.id;
    const { setFieldsValue } = this.props.form;
    let ad = {};

    try {
      let response = await agent.get(`/ads/${id}`);
      ad = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of ads',
      });
    }

    setFieldsValue({
      name: get(ad, 'name'),
      script: get(ad, 'script'),
      showOn: get(ad, 'showOn'),
    });
  }

  handleFormLayoutChange(e) {
    this.setState({ formLayout: e.target.value });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields(async (err, value) => {
      if (err) {
        return false;
      }

      const { name, script, showOn } = value;

      let data = {
        name: name,
        script: script,
        showOn: showOn,
      };

      let id = this.props.match.params.id;

      try {
        // Check page is add new or edit
        if (isEmtpy(id)) {
          await agent.post(`/ads`).send(data);
        } else {
          await agent.put(`/ads/${id}`).send(data);
        }

        // Redirect to all ads
        dispatch(push('/ads/all-ads'));
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not submit ad',
        });
      }
    });
  }

  getFormItemLayout(formLayout) {
    return formLayout === 'horizontal'
      ? {
          labelCol: { span: 4 },
          wrapperCol: { span: 14 },
        }
      : null;
  }

  getButtonItemLayout(formLayout) {
    return formLayout === 'horizontal'
      ? {
          labelCol: { span: 4, offset: 4 },
        }
      : null;
  }

  handleToggle(name) {
    const isToggle = `isShow${name}`;
    this.setState({ [isToggle]: !this.state[isToggle] });
  }

  handleShow(name, event) {
    let isShow = `isShow${name}`;
    let isEnable = `isEnableShow${name}`;
    let checked = event.target.checked;

    this.setState({
      [isEnable]: checked,
      [isShow]: checked ? false : this.state[isShow],
    });
  }

  handleChangeSelectedCategories(value) {
    this.setState({ selectedCategories: value });
  }

  handleChangeSelectedSubCategories(value) {
    this.setState({ selectedSubCategories: value });
  }

  render() {
    const { formLayout, placements } = this.state;

    const id = this.props.match.params.id;
    const formItemLayout = this.getFormItemLayout(formLayout);
    const buttonItemLayout = this.getButtonItemLayout(formLayout);
    const { getFieldDecorator } = this.props.form;
    const title = isEmtpy(id) ? 'Add New Ad' : 'Edit Ad';
    const subTitle = isEmtpy(id)
      ? 'Create a brand new ad and add them to this site.'
      : 'Edit exist ad and overwrite them to this site';
    return (
      <div>
        <Title>{title}</Title>
        <SubTitle>{subTitle}</SubTitle>
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <FormItem label="Name" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input name',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="Script" {...formItemLayout}>
            {getFieldDecorator('script', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input ad script',
                },
              ],
            })(<TextArea rows={8} />)}
          </FormItem>
          <FormItem label="Show On" {...formItemLayout}>
            {getFieldDecorator('showOn', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please select place to show ad',
                },
              ],
            })(
              <Select style={{ width: 200 }}>
                <Option value="">None</Option>
                {placements.map(placement => (
                  <Option key={placement} value={placement}>
                    {this.getPlacementName(placement)}
                  </Option>
                ))}
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

export default Form.create()(EditOrAddNewAd);
