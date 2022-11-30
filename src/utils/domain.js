const getDomain = () => {
  return process.env.REACT_APP_WEB_URL.replace(/(^\w+:|^)\/\//, '');
};

export { getDomain };
