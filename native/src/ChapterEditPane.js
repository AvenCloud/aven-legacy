/**
 * @flow
 */

import React, { Component } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { Alert, Text, View, TouchableOpacity } from "react-native";
import ChapterPane from "./ChapterPane";
import { ListItem } from "react-native-elements";
import { WithChapterState, setChapterState } from "./ChapterStore";

class EditorContent extends Component {
  render() {
    const { chapterState, chapterIndex, navigation } = this.props;
    if (!chapterState || !chapterState.components) {
      return <Text>Add something!</Text>;
    }
    const { components } = chapterState;
    const { navigate } = navigation;
    return (
      <View>
        {components.map((c, index) => (
          <ListItem
            title={<Text>{c.name} ({c.type})</Text>}
            key={c.key}
            onPress={() => {
              navigate("EditComponent", {
                chapterIndex,
                context: [c.key]
              });
            }}
            onLongPress={() => {
              Alert.alert(c.type, "", [
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    let changedComponents = chapterState.components.slice();
                    changedComponents.splice(index, 1);
                    setChapterState(chapterIndex, {
                      ...chapterState,
                      components: changedComponents
                    });
                  }
                },
                { text: "Cancel" }
              ]);
            }}
          />
        ))}
      </View>
    );
  }
}

class ChapterEditPaneWithState extends Component {
  render() {
    const { chapter, chapterState, chapterIndex, navigation } = this.props;
    return (
      <ChapterPane
        absolutely={
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("NewComponent", { chapterIndex });
            }}
          >
            <View
              style={{
                height: 50,
                width: 50,
                borderRadius: 25,
                backgroundColor: "#ccc",
                overflow: "hidden",
                padding: 0,
                position: "absolute",
                right: 15,
                bottom: 15
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
        }
      >
        <EditorContent {...this.props} />
      </ChapterPane>
    );
  }
}
const ChapterEditPane = WithChapterState(ChapterEditPaneWithState);

export default ChapterEditPane;
