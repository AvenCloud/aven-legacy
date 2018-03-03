const { createBrowserHistory } = require("history");
const history = createBrowserHistory();
const push = path => history.push(path);
module.exports = {
  history,
  push,
};
