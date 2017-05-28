/**
 * @flow
 */

import React, { Component } from "react";
import { AsyncStorage } from "react-native";
const EventEmitter = require("EventEmitter");
import { GameChapters } from "./Game";

import type { ZListener, ZData } from "./Zed";

const GAME_STORE_KEY = "GameChapterProgress5";
const DOC_INDEX_KEY = "DOCS-INDEX";

(async function() {
  const chapterData = await AsyncStorage.getItem(GAME_STORE_KEY);
  if (chapterData) {
    chapterStates = JSON.parse(chapterData);
    chapterStateEventEmitter.emit("change");
  }

  const docIndex = [];
  const docIndexData = await AsyncStorage.getItem(DOC_INDEX_KEY);
})();

let chapterStates = [];
const chapterStateEventEmitter = new EventEmitter();

const docsEventEmitter = new EventEmitter();
const docs = {};

const WithZed = (ComponentNeedsChapter: Component<*, *, *>) => {
  class ChapterStateConnectorComponent extends Component {
    static navigationOptions = ComponentNeedsChapter.navigationOptions;
    listener: ?ZListener = null;
    state = {
      docs: {},
      chapter: chapterStates[this.props.navigation.state.params.chapterIndex]
    };
    componentDidMount() {
      this.listener = chapterStateEventEmitter.addListener(
        "change",
        this.chapterChange
      );
      this.listener = docsEventEmitter.addListener("change", this.docChange);
    }
    chapterChange = () => {
      const { chapterIndex } = this.props.navigation.state.params;
      if (chapterStates[chapterIndex] !== this.state.chapter) {
        this.setState({ chapter: chapterStates[chapterIndex] });
      }
    };
    docChange = (docName: string) => {
      if (Object.keys(this.state.docs).indexOf(docName) !== -1) {
        this.setState(state => ({
          docs: { ...state.docs, [docName]: docs[docName] }
        }));
      }
    };
    setDoc = async (docName: string, docValue: ZData) => {
      docs[docName] = docValue;
      docsEventEmitter.emit("change", docName);
      const chapterData = await AsyncStorage.setItem(
        `DOCS-${docName}`,
        JSON.stringify(docValue)
      );
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
          docs={this.state.docs}
          chapter={chapter}
          chapterIndex={chapterIndex}
          chapterState={chapterState}
          setDoc={this.setDoc}
          setChapterState={async (index, newState) => {
            chapterStates[index] = newState;
            chapterStateEventEmitter.emit("change");
            const chapterData = await AsyncStorage.setItem(
              GAME_STORE_KEY,
              JSON.stringify(chapterStates)
            );
          }}
        />
      );
    }
  }
  return ChapterStateConnectorComponent;
};

export { WithZed };
