import { createAction, createReducer } from 'redux-act';
import { push } from 'react-router-redux';
import { pendingTask, begin, end } from 'react-redux-spinner';
import Cookie from 'js-cookie';
import { getDomain } from 'utils/domain';
import jwtDecode from 'jwt-decode';
import isEmpty from 'lodash/isEmpty';

const REDUCER = 'app';
const NS = `@@${REDUCER}/`;

export const _setFrom = createAction(`${NS}SET_FROM`);
export const _setLoading = createAction(`${NS}SET_LOADING`);
export const _setHideLogin = createAction(`${NS}SET_HIDE_LOGIN`);

export const setUserState = createAction(`${NS}SET_USER_STATE`);
export const setUpdatingContent = createAction(`${NS}SET_UPDATING_CONTENT`);
export const setActiveDialog = createAction(`${NS}SET_ACTIVE_DIALOG`);
export const deleteDialogForm = createAction(`${NS}DELETE_DIALOG_FORM`);
export const addSubmitForm = createAction(`${NS}ADD_SUBMIT_FORM`);
export const deleteSubmitForm = createAction(`${NS}DELETE_SUBMIT_FORM`);
export const setLayoutState = createAction(`${NS}SET_LAYOUT_STATE`);
export const setUserInfo = createAction(`${NS}SET_USER_INFO`);

export const setLoading = isLoading => {
  const action = _setLoading(isLoading);
  action[pendingTask] = isLoading ? begin : end;
  return action;
};

export const resetHideLogin = () => (dispatch, getState) => {
  const state = getState();
  if (state.pendingTasks === 0 && state.app.isHideLogin) {
    dispatch(_setHideLogin(false));
  }
  return Promise.resolve();
};

export const initAuth = roles => (dispatch, getState) => {
  // Use Axios there to get User Data by Auth Token with Bearer Method Authentication

  const token = window.localStorage.getItem('app.Authorization');
  const decode = !isEmpty(token) ? jwtDecode(token) : null;
  const userRole = !isEmpty(decode) ? decode.role : localStorage.getItem('app.Role');
  const state = getState();

  if (!isEmpty(decode)) {
    dispatch(
      setUserInfo({
        id: decode.id,
        email: decode.email,
        username: decode.username,
        firstName: decode.firstName,
        lastName: decode.lastName,
        role: decode.role,
        avatar: decode.avatar,
      }),
    );
  }

  const users = {
    administrator: {
      email: 'admin@mediatec.org',
      role: 'administrator',
    },
    agent: {
      email: 'agent@mediatec.org',
      role: 'agent',
    },
    editor: { role: 'editor' },
    author: { role: 'author' },
    contributor: { role: 'contributor' },
    subscriber: { role: 'subscriber' },
  };

  const setUser = userState => {
    console.log(...userState);
    dispatch(
      setUserState({
        userState: {
          ...userState,
        },
      }),
    );
    if (!roles.find(role => role === userRole)) {
      if (!(state.routing.location.pathname === '/posts/all-posts')) {
        dispatch(push('/posts/all-posts'));
      }
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

  switch (userRole) {
    case 'administrator':
      return setUser(users.administrator, userRole);
    case 'agent':
      return setUser(users.agent, userRole);
    case 'editor':
      return setUser(users.editor, userRole);
    case 'author':
      return setUser(users.author, userRole);
    case 'contributor':
      return setUser(users.contributor, userRole);
    case 'subscriber':
      return setUser(users.subscriber, userRole);
    default:
      const location = state.routing.location;
      const from = location.pathname + location.search;
      dispatch(_setFrom(from));
      dispatch(push('/login'));
      return Promise.reject();
  }
};

export function login(username, password, dispatch) {
  // Use Axios there to get User Auth Token with Basic Method Authentication
  dispatch(push('/login'));
  dispatch(_setFrom(''));
  return false;
}

export const logout = () => (dispatch, getState) => {
  dispatch(
    setUserState({
      userState: {
        email: '',
        role: '',
      },
    }),
  );
  window.localStorage.setItem('app.Authorization', '');
  window.localStorage.setItem('app.Role', '');
  Cookie.remove('app.Authorization', { domain: getDomain() });
  dispatch(push('/login'));
};

const initialState = {
  // APP STATE
  from: '',
  isUpdatingContent: false,
  isLoading: false,
  activeDialog: '',
  dialogForms: {},
  submitForms: {},
  isHideLogin: false,

  // LAYOUT STATE
  layoutState: {
    isMenuTop: false,
    menuMobileOpened: false,
    menuCollapsed: false,
    menuShadow: false,
    themeLight: false,
    squaredBorders: false,
    borderLess: true,
    fixedWidth: false,
    settingsOpened: false,
  },

  // USER STATE
  userState: {
    email: '',
    role: '',
  },

  userInfo: {
    id: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    avatar: {},
  },
};

export default createReducer(
  {
    [_setFrom]: (state, from) => ({ ...state, from }),
    [_setLoading]: (state, isLoading) => ({ ...state, isLoading }),
    [_setHideLogin]: (state, isHideLogin) => ({ ...state, isHideLogin }),
    [setUpdatingContent]: (state, isUpdatingContent) => ({
      ...state,
      isUpdatingContent,
    }),
    [setUserState]: (state, { userState }) => ({ ...state, userState }),
    [setUserInfo]: (state, userInfo) => ({ ...state, userInfo }),
    [setLayoutState]: (state, param) => {
      const layoutState = { ...state.layoutState, ...param };
      const newState = { ...state, layoutState };
      window.localStorage.setItem('app.layoutState', JSON.stringify(newState.layoutState));
      return newState;
    },
    [setActiveDialog]: (state, activeDialog) => {
      const result = { ...state, activeDialog };
      if (activeDialog !== '') {
        const id = activeDialog;
        result.dialogForms = { ...state.dialogForms, [id]: true };
      }
      return result;
    },
    [deleteDialogForm]: (state, id) => {
      const dialogForms = { ...state.dialogForms };
      delete dialogForms[id];
      return { ...state, dialogForms };
    },
    [addSubmitForm]: (state, id) => {
      const submitForms = { ...state.submitForms, [id]: true };
      return { ...state, submitForms };
    },
    [deleteSubmitForm]: (state, id) => {
      const submitForms = { ...state.submitForms };
      delete submitForms[id];
      return { ...state, submitForms };
    },
  },
  initialState,
);
