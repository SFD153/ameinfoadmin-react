import isEmpty from 'lodash/isEmpty';

const getCurrentUser = data => {
  const { userId, userInfo } = data;
  let user;
  if (isEmpty(userId)) {
    user = userInfo.id;
  } else {
    user = userId;
  }

  return user;
};

export { getCurrentUser };
