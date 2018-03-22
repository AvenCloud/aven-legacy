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
      this._updateApp();
    });
  }
  componentDidCatch(e) {
    this.setState({ error: e });
  }
  componentWillUnmount() {
    this.props.agent.offStatus(this._setStatus);
    this.props.agent.unsubscribe(this.props.recordID, this._updateApp);
    this._unlistenHistory();
  }
  _clearError = () => this.setState({ error: null });
  _setStatus = status => this.setState({ status });
  _updateApp = async newRecord => {
    let record = newRecord;
    if (record) {
      this._lastRecord = record;
    } else {
      record = this._lastRecord || this.props.initialRecord;
    }
    if (!record) {
      throw "Cannot find app record!";
    }
    const ExecComponent = await this.props.agent.execDoc(
      record.docID,
      this.props.recordID,
      appPath,
    );
    this.setState({ ExecComponent, error: null });
  };
  state = {
    status: {},
    ExecComponent: this.props.initialComponent,
    error: this.props.initialError,
  };
  render() {
    const { status, ExecComponent, error } = this.state;
    const ErrorComponent = this.props.errorComponent;
    if (error || !ExecComponent) {
      return <ErrorComponent onRetry={this._clearError} error={error} />;
    }
    if (ExecComponent) {
      return <ExecComponent status={status} agent={this.props.agent} />;
    }
    return null;
  }
}

async function setupApp() {
  const mainRecord = "App";
  const netAgent = await BrowserNetworkAgent();
  const authAgent = ClientAuthAgent(netAgent, { cache: window.avenDocCache });
  const authUserID = cookie.get("authUserID");
  const authSession = cookie.get("authSession");
  authAgent.setSession(authUserID, authSession);
  const appAgent = ExecAgent(authAgent, BrowserPlatformDeps);

  const record = await appAgent.dispatch({
    type: "GetRecordAction",
    recordID: mainRecord,
  });

  const docID = record && record.docID;
  if (!record || !docID) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: `App not found!`,
    };
  }
  const errorComponent = await appAgent.execDoc(docID, mainRecord, "ErrorPage");
  let initialError = null;
  let initialComponent = null;
  try {
    initialComponent = await appAgent.execDoc(docID, mainRecord, appPath);
  } catch (e) {
    initialError = e;
  }
  ReactDOM.render(
    <LoadingContainer
      recordID={mainRecord}
      agent={appAgent}
      initialRecord={record}
      initialComponent={initialComponent}
      initialError={initialError}
      errorComponent={errorComponent}
    />,
    document.getElementById("root"),
  );
}

window.onload = () => {
  setupApp()
    .then(() => {
      console.log("App started!");
    })
    .catch(console.error);
};
