/**
 * @flow
 */

import React, { Component } from "react";
import { List, ListItem } from "react-native-elements";
import { GameChapters } from "./Game";
import { WithChapterState, setChapterState } from "./ChapterStore";

class NewComponentScreenWithState extends Component {
  static navigationOptions = {
    title: "Add Component.."
  };
  render() {
    const { chapterState, navigation } = this.props;
    const { state, goBack } = navigation;
    const { chapterIndex } = state.params;
    const validComponents = GameChapters[chapterIndex].components;
    return (
      <List>
        {validComponents.map((componentName, i) => (
          <ListItem
            key={i}
            title={componentName}
            onPress={() => {
              setChapterState(chapterIndex, {
                ...chapterState,
                components: [
                  ...(chapterState.components || []),
                  { type: componentName, key: ''+Date.now() }
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
const NewComponentScreen = WithChapterState(NewComponentScreenWithState);

export default NewComponentScreen;
