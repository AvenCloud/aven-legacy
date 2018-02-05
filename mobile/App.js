import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ExecAgent = require("./ExecAgent");
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
  agent = null;
  async componentDidMount() {
    const netAgent = await ReactNativeNetworkAgent(upstreamDev);
    this.agent = ExecAgent(netAgent);
    this.agent.onStatus(this._setStatus);
    const mainRecord = "App";
    const result = await this.agent.dispatch({
      type: "GetRecordAction",
      recordID: mainRecord,
    });
    const { docID } = result;
    if (!result || !docID) {
      throw {
        statusCode: 404,
        code: "INVALID_APP",
        message: `App Record doc "${mainRecord}" not found!`,
      };
    }
    const doc = await this.agent.dispatch({
      type: "GetDocAction",
      docID: docID,
      recordID: mainRecord,
    });
    const ExecComponent = await this.agent.exec(doc, [
      { recordID: mainRecord, docID },
    ]);
    this.setState({ ExecComponent });
    // this.agent.onRecordDoc("App", this._setRecord);
  }
  componentWillUnmount() {
    this.agent.offStatus(this._setStatus);
    // this.agent.offRecordDoc("App", this._setRecord);
  }
  _setStatus = status => this.setState({ status });
  _setRecord = record => this.setState({ record });
  state = { status: {}, ExecComponent: null };
  render() {
    const { status, ExecComponent } = this.state;
    if (ExecComponent) {
      return <ExecComponent />;
    }
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
