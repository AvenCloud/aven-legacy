/**
 * @flow
 */

import React, { Component } from "react";
import { Text, View } from "react-native";
import ChapterPane from "./ChapterPane";
import { WithChapterState } from "./ChapterStore";
import { GameComponents } from "./Game";

class ChapterMessage extends Component {
  render() {
    const {chapter, chapterState} = this.props;
    const errorMessage = chapter.getError(chapterState);
    return (
      <View
        style={{
          backgroundColor: errorMessage ? 'white' : '#0c0',
          height: 100,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
        }}
      >
        <Text style={{color: errorMessage ? '#c00' : 'white', textAlign: 'center'}}>
          {errorMessage || 'Wow you did it!'}
        </Text>
      </View>
    );
  }
}

class ChapterResultsPaneWithState extends Component {
  render() {
    const { chapter, chapterState } = this.props;
    if (!chapterState || !chapterState.components) {
      return <ChapterPane />;
    }
    return (
      <ChapterPane absolutely={<ChapterMessage {...this.props} />}>
        {chapterState.components.map((el, index) => {
          const Comp = GameComponents[el.type];
          return <Comp key={el.key} {...el} />;
        })}
      </ChapterPane>
    );
  }
}
const ChapterResultsPane = WithChapterState(ChapterResultsPaneWithState);

export default ChapterResultsPane;
