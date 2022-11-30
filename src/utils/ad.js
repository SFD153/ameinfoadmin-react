import forOwn from 'lodash/forOwn';

const getMeta = metas => {
  let meta = {};
  metas.forEach(value => {
    meta[value] = true;
  });

  return meta;
};

const getOption = metas => {
  let options = [];
  forOwn(metas, (option, key) => {
    if (option === true) {
      options.push(key);
    }
  });

  return options;
};

export { getMeta, getOption };
