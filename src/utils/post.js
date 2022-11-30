import uniqBy from 'lodash/uniqBy';
import moment from 'moment/moment';

function getUniqueDate(dates) {
  let listOfDate = dates.map(date => {
    return {
      timestamp: date.createdAt,
      display: moment(date.createdAt)
        .locale('en')
        .format('MMMM YYYY'),
    };
  });

  return uniqBy(listOfDate, 'display');
}

export { getUniqueDate };
