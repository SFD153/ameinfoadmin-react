import moment from 'moment';

const NOW = new Date();
const CURRENT_DATE = moment(NOW, 'YYYY-MM-DD');
const CURRENT_TIME = moment(NOW, 'HH:mm');

export { NOW, CURRENT_TIME, CURRENT_DATE };
