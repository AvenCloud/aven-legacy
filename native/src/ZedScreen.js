/**
 * @flow
 */

import React, { Component } from "react";
import { List, ListItem } from "react-native-elements";
import { Alert } from "react-native";
import { ZAddress, ZConnect } from "./Zed";

class HomeScreen extends Component {
  static navigationOptions = () => ({
    title: "zEd"
  });
  static getZed = props => ZAddress("wat");
  render() {
    const { navigate } = this.props.navigation;
    return (
      <List containerStyle={{ marginBottom: 20 }}>
        <ListItem
          containerStyle={{ marginTop: 20 }}
          title={this.props.zed}
          onPress={() => {
            Alert.alert("not yet built");
          }}
        />
      </List>
    );
  }
}

const ZConnectedHomeScreen = ZConnect(HomeScreen);

export default ZConnectedHomeScreen;
