import findIndex from 'lodash/find';
import _set from 'lodash/set';
import _get from 'lodash/get';
import forOwn from 'lodash/forOwn';
import snakeCase from 'lodash/snakeCase';

const get = (items, key) => {
  let model = findIndex(items, { name: key });
  return _get(model, 'value', []);
};

const set = (items, key, value) => {
  let item = findIndex(items, { name: key });
  _set(item, 'value', value);
  return item;
};

const setEach = (items, options) => {
  let results = [];
  forOwn(options, (value, name) => {
    let result = set(items, snakeCase(name), value || '');
    results.push(result);
  });
  return results;
};

export { get, set, setEach };
