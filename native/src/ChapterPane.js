/**
 * @flow
 */

import React, { Component } from "react";
import { Dimensions, StyleSheet, View, ScrollView } from "react-native";
import { List } from "react-native-elements";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

class ChapterPane extends Component {
  render() {
    return (
      <View style={{ flex: 1, }}>
        <ScrollView style={{ flex: 1, width: SCREEN_WIDTH, }}>
          {this.props.children}
        </ScrollView>
        {this.props.absolutely}
      </View>
    );
  }
}

export default ChapterPane;
