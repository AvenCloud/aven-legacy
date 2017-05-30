/**
 * @flow
 */

import React, { Component } from "react";
import { List, ListItem } from "react-native-elements";
import { GameChapters } from "./Game";
import { WithZed } from "./ZedStore";

class NewComponentScreenWithState extends Component {
  static navigationOptions = {
    title: "Add Component.."
  };
  render() {
    const { chapterState, navigation, setChapterState } = this.props;
    const { state, goBack } = navigation;
    const { chapterIndex } = state.params;
    const chapter = GameChapters[chapterIndex];
    return (
      <List>
        {chapter.components.map((componentName, i) => (
          <ListItem
            key={i}
            title={componentName}
            onPress={() => {
              setChapterState(chapterIndex, {
                ...chapterState,
                components: [
                  ...(chapterState.components || []),
                  { type: componentName, key: "" + Date.now() }
                ]
              });
              goBack();
            }}
          />
        ))}
      </List>
    );
  }
}
const NewComponentScreen = WithZed(NewComponentScreenWithState);

export default NewComponentScreen;
