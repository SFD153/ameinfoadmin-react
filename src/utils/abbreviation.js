function getOrderAbbreviation(order) {
  let orderAbbreviation = null;

  if (order === 'ascend') {
    orderAbbreviation = 'ASC';
  }

  if (order === 'descend') {
    orderAbbreviation = 'DESC';
  }

  return orderAbbreviation;
}

export { getOrderAbbreviation };
