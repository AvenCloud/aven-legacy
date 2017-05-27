/**
 * @flow
 */

import React, { Component } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { View, TouchableOpacity } from "react-native";

class PlusButton extends Component {
  render() {
    const { onPress } = this.props;
    return (
      <TouchableOpacity
        style={{
          height: 50,
          width: 50,
          position: "absolute",
          right: 15,
          bottom: 15,
        }}
        onPress={onPress}
      >
        <View
          style={{
            borderRadius: 25,
            backgroundColor: "#ccc",
            overflow: "hidden",
            left: 0, right: 0, top: 0, bottom: 0,
            position: "absolute",
          }}
        >
          <Icon
            name="ios-add"
            size={40}
            style={{ marginHorizontal: 15, marginVertical: 5 }}
            color="black"
          />
        </View>
      </TouchableOpacity>
    );
  }
}

export default PlusButton;
