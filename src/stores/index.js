import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createHistory from 'history/createHashHistory';
import thunk from 'redux-thunk';
import reducer from 'ducks';
import { routerMiddleware } from 'react-router-redux';

const history = createHistory();
const router = routerMiddleware(history);
const middlewares = [router, thunk];
const isLogger = false;
if (isLogger && process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger');
  middlewares.push(logger);
}
const store = createStore(reducer, composeWithDevTools(applyMiddleware(...middlewares)));
const dispatch = store.dispatch;

export { history, store, dispatch };
