import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ExecAgent = require("./src/ExecAgent");
const PlatformDeps = require("./PlatformDeps");
const ReactNativeNetworkAgent = require("./ReactNativeNetworkAgent");

const upstreamProd = {
  host: "aven.io",
  useSSL: true,
};
const upstreamDev = {
  host: "localhost:3000",
  useSSL: false,
};

export default class App extends React.Component {
  static mainRecord = "App";
  agent = null;
  async componentDidMount() {
    const netAgent = await ReactNativeNetworkAgent(upstreamProd);
    this.agent = ExecAgent(netAgent, PlatformDeps);
    this.agent.onStatus(this._setStatus);
    const result = await this.agent.dispatch({
      type: "GetRecordAction",
      recordID: App.mainRecord,
    });
    const { docID } = result;
    if (!result || !docID) {
      throw {
        statusCode: 404,
        code: "INVALID_APP",
        message: `App Record doc "${App.mainRecord}" not found!`,
      };
    }
    const doc = await this.agent.dispatch({
      type: "GetDocAction",
      docID: docID,
      recordID: App.mainRecord,
    });
    const ExecComponent = await this.agent.exec(doc, [
      { recordID: App.mainRecord, docID },
    ]);
    this.setState({ ExecComponent });
    this.agent.subscribe(App.mainRecord, this._updateApp);
  }
  componentWillUnmount() {
    this.agent.offStatus(this._setStatus);
    this.agent.unsubscribe(App.mainRecord, this._updateApp);
  }
  _setStatus = status => this.setState({ status });
  _setRecord = record => this.setState({ record });
  _updateApp = async record => {
    console.log("woah!", record);
    const doc = await this.agent.dispatch({
      type: "GetDocAction",
      docID: record.docID,
      recordID: App.mainRecord,
    });
    const ExecComponent = await this.agent.exec(doc, [
      { recordID: App.mainRecord, docID: record.docID },
    ]);
    this.setState({ ExecComponent });
  };
  state = { status: {}, ExecComponent: null };
  render() {
    const { status, ExecComponent } = this.state;
    if (ExecComponent) {
      return <ExecComponent status={status} agent={this.agent} />;
    }
    return null;
    return (
      <View style={styles.container}>
        <Text>{JSON.stringify(this.state.status)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
