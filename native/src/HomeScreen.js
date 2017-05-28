/**
 * @flow
 */

import React, { Component } from "react";
import { List, ListItem } from "react-native-elements";
import { GameChapters } from "./Game";
import { Alert } from "react-native";

class HomeScreen extends Component {
  static navigationOptions = () => ({
    title: "zEducation"
  });
  render() {
    const { navigate } = this.props.navigation;
    return (
      <List containerStyle={{ marginBottom: 20 }}>
        {GameChapters.map((chapter, i) => (
          <ListItem
            key={i}
            title={chapter.title}
            onPress={() => navigate("Chapter", { chapterIndex: i })}
          />
        ))}
        <ListItem
          containerStyle={{ marginTop: 20 }}
          title="TESTING ONLY: Reset Game"
          onPress={() => {
            Alert.alert("not yet built");
          }}
        />
      </List>
    );
  }
}

export default HomeScreen;
