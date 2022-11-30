import superAgent from 'superagent';
import superAgentUse from 'superagent-use';
import superAgentPrefix from 'superagent-prefix';

const agent = superAgentUse(superAgent);
const prefix = superAgentPrefix;

agent.use(prefix(process.env.REACT_APP_API_URL));

export default agent;
