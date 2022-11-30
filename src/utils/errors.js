import get from 'lodash/get';
const getErrorMessage = error => {
  const body = get(error, 'response.body');

  let result = {};
  if (body) {
    result = body;
  } else {
    result.code = 'E_SERVER_ERROR';
    result.message = error.message;
  }

  return result;
};

export { getErrorMessage };
