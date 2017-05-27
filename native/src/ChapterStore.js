/**
 * @flow
 */

import React, { Component } from "react";
import { AsyncStorage } from "react-native";
const EventEmitter = require("EventEmitter");
import { GameChapters } from './Game';

const GAME_STORE_KEY = "GameChapterProgress5";

(async function() {
  const chapterData = await AsyncStorage.getItem(GAME_STORE_KEY);
  if (chapterData) {
    chapterStates = JSON.parse(chapterData);
    chapterStateEventEmitter.emit('change');
  }
})();


const chapterStates = [];
const chapterStateEventEmitter = new EventEmitter();
const WithChapterState = ComponentNeedsChapter => {
  class ChapterStateConnectorComponent extends Component {
    static navigationOptions = ComponentNeedsChapter.navigationOptions;
    state = {
      chapter: chapterStates[this.props.navigation.state.params.chapterIndex]
    };
    componentDidMount() {
      ComponentNeedsChapter.displayName;
      this.listener = chapterStateEventEmitter.addListener(
        'change',
        this.chapterChange
      );
    }
    chapterChange = () => {
      const { chapterIndex } = this.props.navigation.state.params;
      if (chapterStates[chapterIndex] !== this.state.chapter) {
        this.setState({ chapter: chapterStates[chapterIndex] });
      }
    };
    componentWillUnmount() {
      this.listener && this.listener.remove();
    }
    render() {
      const { chapterIndex } = this.props.navigation.state.params;
      const chapter = GameChapters[chapterIndex];
      const chapterState = this.state.chapter || {};
      return (
        <ComponentNeedsChapter
          {...this.props}
          chapter={chapter}
          chapterIndex={chapterIndex}
          chapterState={chapterState}
        />
      );
    }
  }
  return ChapterStateConnectorComponent;
};
async function setChapterState(index, newState) {
  chapterStates[index] = newState;
  chapterStateEventEmitter.emit('change');
  const chapterData = await AsyncStorage.setItem(GAME_STORE_KEY, JSON.stringify(chapterStates));
}

async function resetGame() {
  chapterStates = [];
  chapterStateEventEmitter.emit('change');
  const chapterData = await AsyncStorage.setItem(GAME_STORE_KEY, '');
}


export {
  setChapterState,
  resetGame,
  WithChapterState,
};
