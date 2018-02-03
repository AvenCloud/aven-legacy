import React from "react";
import { StyleSheet, Text, View } from "react-native";

const { ReactNativeAgent } = require("./Agent");

const upstreamProd = {
  host: "aven.io",
  useSSL: true,
};
const upstreamDev = {
  host: "localhost:3000",
  useSSL: false,
};

const agent = new ReactNativeAgent({
  upstream: upstreamDev,
});

export default class App extends React.Component {
  componentDidMount() {
    agent.connect();
    agent.onStatus(this._setStatus);
    agent.onRecordDoc("App", this._setRecord);
  }
  componentWillUnmount() {
    agent.offStatus(this._setStatus);
    agent.offRecordDoc("App", this._setRecord);
  }
  _setStatus = status => this.setState({ status });
  _setRecord = record => this.setState({ record });
  state = { status: {}, record: {} };
  render() {
    return (
      <View style={styles.container}>
        <Text style={{}}>{JSON.stringify(this.state.status)}</Text>
        <Text>{JSON.stringify(this.state.record)}</Text>
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
