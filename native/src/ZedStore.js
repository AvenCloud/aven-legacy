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
})();

async function markDocAsTracked(docName: string) {
  if (docIndex.indexOf(docName) === -1) {
    docIndex.push(docName);
    await AsyncStorage.setItem(DOC_INDEX_KEY, JSON.stringify(docIndex));
  }
}

let chapterStates = [];
const chapterStateEventEmitter = new EventEmitter();

class ZedStore {
  constructor(input) {
    this.hyrdrateData();
  }

  async hyrdrateData() {
    const docIndexData = await AsyncStorage.getItem(DOC_INDEX_KEY);
    if (docIndexData) {
      this.docIndex = [...docIndex, ...JSON.parse(docIndexData)];
    }
  }
  docIndex: Array<string> = [];
  docsEventEmitter = new EventEmitter();
  docs = {}; // mutation only!
}

const theStore = new ZedStore();
const docIndex = [];

const WithZed = (ComponentNeedsChapter: Component<*, *, *>) => {
  // $FlowFixMe lol
  const getDocsForProps = ComponentNeedsChapter.getDocsForProps;
  class ChapterStateConnectorComponent extends Component {
    // $FlowFixMe lol
    static navigationOptions = ComponentNeedsChapter.navigationOptions;
    listener: ?ZListener = null;
    constructor(props) {
      super(props);
      const initialDocsState = {};
      getDocsForProps &&
        getDocsForProps(props).forEach(docName => {
          initialDocsState[docName] = docs[docName];
        });
      this.state = {
        docs: initialDocsState,
        chapter: chapterStates[props.navigation.state.params.chapterIndex]
      };
    }
    componentDidMount() {
      this.listener = chapterStateEventEmitter.addListener(
        "change",
        this.chapterChange
      );
      this.listener = theStore.docsEventEmitter.addListener(
        "change",
        this.docChange
      );
    }
    chapterChange = () => {
      const { chapterIndex } = this.props.navigation.state.params;
      if (chapterStates[chapterIndex] !== this.state.chapter) {
        this.setState({ chapter: chapterStates[chapterIndex] });
      }
    };
    docChange = async (docName: string) => {
      if (Object.keys(this.state.docs).indexOf(docName) !== -1) {
        this.setState(state => ({
          docs: { ...state.docs, [docName]: theStore.docs[docName] }
        }));
      }
    };
    setDoc = async (docName: string, docValue: ZData) => {
      docs[docName] = docValue;
      docsEventEmitter.emit("change", docName);
      await markDocAsTracked(docName);
      const chapterData = await AsyncStorage.setItem(
        `DOCS-${docName}`,
        JSON.stringify(docValue)
      );
    };
    componentWillUnmount() {
      this.listener && this.listener.remove();
    }
    render() {
      const chapterState = this.state.chapter || {};
      return (
        <ComponentNeedsChapter
          {...this.props}
          docs={this.state.docs}
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
