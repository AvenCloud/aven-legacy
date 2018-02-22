import "babel-polyfill";

const React = require("react");
const ReactDOM = require("react-dom");
const ExecAgent = require("./ExecAgent");
const BrowserNetworkAgent = require("./BrowserNetworkAgent");
const BrowserPlatformDeps = require("./BrowserPlatformDeps");

const { createBrowserHistory } = require("history");

const history = createBrowserHistory();

// // Listen for changes to the current location.
// const unlisten = history.listen((location, action) => {
//   // location is an object like window.location
//   console.log(action, location.pathname, location.state)
// })

// // Use push, replace, and go to navigate around.
// history.push('/home', { some: 'state' })

// // To stop listening, call the function returned from listen().
// unlisten()

const initialPath = history.location.pathname
  .split("/")
  .slice(1)
  .join("/");

class LoadingContainer extends React.Component {
  async componentDidMount() {
    this.props.agent.onStatus(this._setStatus);
    this.props.agent.subscribe(this.props.recordID, this._updateApp);
  }
  componentWillUnmount() {
    this.props.agent.offStatus(this._setStatus);
    this.props.agent.unsubscribe(this.props.recordID, this._updateApp);
  }
  _setStatus = status => this.setState({ status });
  _setRecord = record => this.setState({ record });
  _updateApp = async record => {
    const ExecComponent = await this.props.agent.exec(
      record.docID,
      this.props.recordID,
      initialPath,
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
  const appAgent = ExecAgent(netAgent, BrowserPlatformDeps);

  const result = await appAgent.dispatch({
    type: "GetRecordAction",
    recordID: "App",
  });
  const { docID } = result;
  if (!result || !docID) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: `App not found!`,
    };
  }
  const initialComponent = await appAgent.exec(docID, "App", initialPath);
  ReactDOM.render(
    <LoadingContainer
      recordID="App"
      agent={appAgent}
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
