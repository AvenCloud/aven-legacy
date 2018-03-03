import "babel-polyfill";

const React = require("react");
const ReactDOM = require("react-dom");
const ExecAgent = require("./ExecAgent");
const cookie = require("js-cookie");
const BrowserNetworkAgent = require("./BrowserNetworkAgent");
const BrowserPlatformDeps = require("./BrowserPlatformDeps");
const ClientAuthAgent = require("./ClientAuthAgent");

const { history } = require("./BrowserHistory");

let appPath = history.location.pathname
  .split("/")
  .slice(1)
  .join("/");

class LoadingContainer extends React.Component {
  async componentDidMount() {
    this.props.agent.onStatus(this._setStatus);
    this.props.agent.subscribe(this.props.recordID, this._updateApp);
    this._unlistenHistory = history.listen((location, action) => {
      appPath = location.pathname
        .split("/")
        .slice(1)
        .join("/");
      this._updateApp(this._lastRecord || this.props.initialRecord);
    });
  }
  componentWillUnmount() {
    this.props.agent.offStatus(this._setStatus);
    this.props.agent.unsubscribe(this.props.recordID, this._updateApp);
    this._unlistenHistory();
  }
  _setStatus = status => this.setState({ status });
  _updateApp = async record => {
    this._lastRecord = record;
    const ExecComponent = await this.props.agent.exec(
      record.docID,
      this.props.recordID,
      appPath,
    );
    this.setState({ ExecComponent });
  };
  state = { status: {}, ExecComponent: this.props.initialComponent };
  render() {
    const { status, ExecComponent } = this.state;
    if (ExecComponent) {
      return <ExecComponent status={status} agent={this.props.agent} />;
    }
    return null;
  }
}

async function setupApp() {
  const netAgent = await BrowserNetworkAgent();
  const authAgent = ClientAuthAgent(netAgent);
  const authUserID = cookie.get("authUserID");
  const authSession = cookie.get("authSession");
  authAgent.setSession(authUserID, authSession);
  const appAgent = ExecAgent(authAgent, BrowserPlatformDeps);

  const record = await appAgent.dispatch({
    type: "GetRecordAction",
    recordID: "App",
  });
  const { docID } = record;
  if (!record || !docID) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: `App not found!`,
    };
  }
  const initialComponent = await appAgent.exec(docID, "App", appPath);
  ReactDOM.render(
    <LoadingContainer
      recordID="App"
      agent={appAgent}
      initialRecord={record}
      initialComponent={initialComponent}
    />,
    document.getElementById("root"),
  );
}

setupApp()
  .then(() => {
    console.log("App started!");
  })
  .catch(console.error);
