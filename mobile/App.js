import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppLoading } from "expo";
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
  _initialLoad = async () => {
    console.log("ok");
    const netAgent = await ReactNativeNetworkAgent(upstreamProd);
    console.log("wtf");
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
    const ExecComponent = await this.agent.exec(docID, App.mainRecord, "");
    this.agent.subscribe(App.mainRecord, this._updateApp);
    this.setState({ ExecComponent });
  };
  componentWillUnmount() {
    this.agent.offStatus(this._setStatus);
    this.agent.unsubscribe(App.mainRecord, this._updateApp);
  }
  _setStatus = status => this.setState({ status });
  _setRecord = record => this.setState({ record });
  _updateApp = async record => {
    const doc = await this.agent.dispatch({
      type: "GetDocAction",
      docID: record.docID,
      recordID: App.mainRecord,
    });
    const ExecComponent = await this.agent.exec(
      record.docID,
      App.mainRecord,
      "",
    );
    this.setState({ ExecComponent });
  };
  state = { status: {}, ExecComponent: null, isInitialLoad: true };
  render() {
    const { status, ExecComponent, isInitialLoad } = this.state;
    if (isInitialLoad) {
      // return <Text>Uhh</Text>;
      return (
        <AppLoading
          startAsync={this._initialLoad}
          onFinish={() => this.setState({ isInitialLoad: false })}
          onError={console.error}
        />
      );
    }
    if (ExecComponent) {
      return <ExecComponent status={status} agent={this.agent} />;
    }
    return (
      <View style={styles.container}>
        <Text>Not found!</Text>
      </View>
    );

    return null;
  }

  // render() {
  //   const { ExecComponent } = this.state;
  //   if (ExecComponent) {
  //     return <ExecComponent status={null} agent={this.agent} />;
  //   }
  //   return (
  //     <View style={styles.container}>
  //       <Text>{JSON.stringify(this.state)}</Text>
  //     </View>
  //   );
  // }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
