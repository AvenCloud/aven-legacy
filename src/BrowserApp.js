import "babel-polyfill";

const React = require("react");
const ReactDOM = require("react-dom");
const ExecAgent = require("./ExecAgent");
const BrowserNetworkAgent = require("./BrowserNetworkAgent");
const BrowserPlatformDeps = require("./BrowserPlatformDeps");

class LoadingContainer extends React.Component {
  async componentDidMount() {
    const netAgent = await BrowserNetworkAgent();
    this.agent = ExecAgent(netAgent, BrowserPlatformDeps);
    this.agent.onStatus(this._setStatus);
    const result = await this.agent.dispatch({
      type: "GetRecordAction",
      recordID: this.props.recordID,
    });
    const { docID } = result;
    if (!result || !docID) {
      throw {
        statusCode: 404,
        code: "INVALID_APP",
        message: `App Record doc "${this.props.recordID}" not found!`,
      };
    }
    const ExecComponent = await this.agent.exec(docID, this.props.recordID, "");
    this.setState({ ExecComponent });
    this.agent.subscribe(this.props.recordID, this._updateApp);
  }
  componentWillUnmount() {
    this.agent.offStatus(this._setStatus);
    this.agent.unsubscribe(this.props.recordID, this._updateApp);
  }
  _setStatus = status => this.setState({ status });
  _setRecord = record => this.setState({ record });
  _updateApp = async record => {
    const ExecComponent = await this.agent.exec(
      record.docID,
      this.props.recordID,
      "",
    );
    this.setState({ ExecComponent });
  };
  state = { status: {}, ExecComponent: null };
  render() {
    const { status, ExecComponent } = this.state;
    if (ExecComponent) {
      return <ExecComponent status={status} agent={this.agent} />;
    }
    return null;
  }
}

ReactDOM.render(
  <LoadingContainer recordID="App" />,
  document.getElementById("root"),
);
