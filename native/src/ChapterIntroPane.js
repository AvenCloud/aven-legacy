/**
 * @flow
 */

import React, { Component } from "react";
import { Text } from "react-native";
import ChapterPane from "./ChapterPane";
import { WithZed } from "./ZedStore";
import { GameChapters } from "./Game";

class ChapterIntroPaneWithState extends Component {
  render() {
    const chapter = GameChapters[this.props.navigation.state.params.chapterIndex];
    return <ChapterPane><Text>{chapter.description}</Text></ChapterPane>;
  }
}
const ChapterIntroPane = WithZed(ChapterIntroPaneWithState);

export default ChapterIntroPane;
