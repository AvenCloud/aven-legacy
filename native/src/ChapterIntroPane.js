/**
 * @flow
 */

import React, { Component } from "react";
import { Text } from "react-native";
import ChapterPane from "./ChapterPane";
import { WithZed } from "./ChapterStore";

class ChapterIntroPaneWithState extends Component {
  render() {
    const { chapter } = this.props;
    return <ChapterPane><Text>{chapter.description}</Text></ChapterPane>;
  }
}
const ChapterIntroPane = WithZed(ChapterIntroPaneWithState);

export default ChapterIntroPane;
