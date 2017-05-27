/**
 * @flow
 */

import React, { Component } from "react";
import {
  Animated,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback
} from "react-native";
import { TabRouter, NavigationActions } from "react-navigation";
import ChapterEditPane from "./ChapterEditPane";
import ChapterIntroPane from "./ChapterIntroPane";
import ChapterResultsPane from "./ChapterResultsPane";
import { GameChapters } from "./Game";

const SCREEN_WIDTH = Dimensions.get("window").width;

const DefaultChapterRouter = TabRouter({
  ChapterIntroPane: { screen: ChapterIntroPane },
  ChapterEditPane: { screen: ChapterEditPane },
  ChapterResultsPane: { screen: ChapterResultsPane }
});

const ChapterRouter = {
  ...DefaultChapterRouter,

  getStateForAction: (action, lastState) => {
    // uh override??
    return DefaultChapterRouter.getStateForAction(action, lastState);
  }
};

class ChapterScreen extends Component {
  state = { scrollPosition: new Animated.Value(0) };

  componentDidUpdate() {
    const newIndex = this.props.navigation.state.index;
    const scrollView = this._scroller.getNode();
    scrollView.scrollTo({ x: newIndex * SCREEN_WIDTH });
  }
  componentDidMount() {
    const newIndex = this.props.navigation.state.index;
    const scrollView = this._scroller.getNode();
    scrollView.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: false });
  }
  static navigationOptions = ({ navigation }) => ({
    headerBackTitle: "Cancel",
    title: GameChapters[navigation.state.params.chapterIndex].title
  });
  static router = ChapterRouter;
  render() {
    const { scrollPosition } = this.state;
    const { navigation } = this.props;
    const { chapterIndex } = navigation.state.params;
    const { navigate } = navigation;
    return (
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          ref={r => {
            this._scroller = r;
          }}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollPosition } } }],
            { useNativeDriver: false }
          )}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          horizontal={true}
          pagingEnabled={true}
        >
          {navigation.state.routes.map(route => {
            const Co = ChapterRouter.getComponentForRouteName(route.routeName);
            return <Co key={route.key} navigation={navigation} />;
          })}
        </Animated.ScrollView>
        <View style={{ height: 50, flexDirection: "row" }}>

          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={() => {
              navigate("ChapterIntroPane");
            }}
          >
            <View style={{ backgroundColor: "white", flex: 1 }}>
              <Text>Learn</Text>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={() => {
              navigate("ChapterEditPane");
            }}
          >
            <View style={{ backgroundColor: "white", flex: 1 }}>
              <Text>Edit</Text>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={() => {
              navigate("ChapterResultsPane");
            }}
          >
            <View style={{ backgroundColor: "white", flex: 1 }}>
              <Text>Results</Text>
            </View>
          </TouchableWithoutFeedback>
          <Animated.View
            pointerEvents="none"
            style={{
              backgroundColor: "#17591722",
              width: SCREEN_WIDTH,
              position: "absolute",
              right: SCREEN_WIDTH - SCREEN_WIDTH / 3,
              top: 0,
              bottom: 0,
              transform: [
                {
                  translateX: scrollPosition.interpolate({
                    inputRange: [0, SCREEN_WIDTH],
                    outputRange: [0, SCREEN_WIDTH / 3]
                  })
                }
              ]
            }}
          />
        </View>
      </View>
    );
  }
}

export default ChapterScreen;
