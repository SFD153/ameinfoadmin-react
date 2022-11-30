import { createReducer } from 'redux-act';
import { push } from 'react-router-redux';
import * as app from './app';
import { notification } from 'antd';
import agent from 'utils/agent';
import { getDomain } from 'utils/domain';
import Cookie from 'js-cookie';
import jwtDecode from 'jwt-decode';

export const REDUCER = 'login';

export const submit = ({ username, password }) => async (dispatch, getState) => {
  try {
    //////////////////////////////////////////////
    dispatch(app.addSubmitForm(REDUCER));
    const res = await agent.post('/login').send({
      email: username,
      password,
    });

    if (res.body.token) {
      const decode = await jwtDecode(res.body.token);
      if (decode) {
        window.localStorage.setItem('app.Authorization', res.body.token);
        window.localStorage.setItem('app.Role', '');
        Cookie.set('app.Authorization', res.body.token, { domain: getDomain() });

        dispatch(app._setHideLogin(true));
        dispatch(push('/posts/all-posts'));
        window.location.reload();

        notification.open({
          type: 'success',
          message: 'You have successfully logged in!',
          description: 'Welcome to the AMEinfo Admin!',
        });
        dispatch(app.deleteSubmitForm(REDUCER));
      } else throw new Error('Error');

      // window.localStorage.setItem("app.Role", decode.role.name);
    } else throw new Error('Error');
    dispatch(app.deleteSubmitForm(REDUCER));
  } catch (error) {
    dispatch(app.deleteSubmitForm(REDUCER));
    return error;
  }
};

export const submitRegister = payloads => async dispatch => {
  try {
    const res = await agent.post('/register').send(payloads);
    if (res.body) {
      const decode = jwtDecode(res.body.token);
      if (decode) {
        window.localStorage.setItem('app.Authorization', res.body.token);
        window.localStorage.setItem('app.Role', '');
        Cookie.set('app.Authorization', res.body.token, { domain: getDomain() });

        dispatch(app._setHideLogin(true));
        dispatch(push('/posts/all-posts'));
        window.location.reload();
        notification.open({
          type: 'success',
          message: 'You have successfully logged in!',
          description: 'Welcome to the AMEinfo Admin!',
        });
      } else throw new Error('Error');
    } else throw new Error('Error');
  } catch (error) {
    notification.open({
      type: 'error',
      message: 'Error!',
      description: 'Can not login',
    });
  }
};

const initialState = {};

export default createReducer({}, initialState);
