import isPlainObject from 'lodash/isPlainObject';

const getEvent = (name, value) => {
  return {
    target: {
      name: name,
      value: isPlainObject(value) ? value.target.value : value,
    },
  };
};

export { getEvent };
