/**
 * @flow
 */

import React, { Component } from "react";
import { AsyncStorage, View, BackHandler, Platform } from "react-native";
import {
  StackNavigator,
  NavigationActions,
  addNavigationHelpers
} from "react-navigation";
import { List, ListItem } from "react-native-elements";

import HomeScreen from "./HomeScreen";
import ChapterScreen from "./ChapterScreen";
import NewComponentScreen from "./NewComponentScreen";
import EditComponentScreen from "./EditComponentScreen";

const APP_TOP_PADDING = Platform.OS === 'ios' ? 0 : 20;

const AppNavigator = StackNavigator(
  {
    Home: { screen: HomeScreen },
    Chapter: { screen: ChapterScreen },
    NewComponent: { screen: NewComponentScreen },
    EditComponent: { screen: EditComponentScreen }
  },
  {
    mode: "modal"
  }
);

const NAV_STORE_KEY = "NavStoreKey7";
class App extends Component {
  state = {
    nav: null
  };
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return this.dispatch(NavigationActions.back(null));
    });

    const navData = await AsyncStorage.getItem(NAV_STORE_KEY);
    if (navData) {
      this.setState({ nav: JSON.parse(navData) });
    } else {
      this.setState({
        nav: AppNavigator.router.getStateForAction(NavigationActions.init())
      });
    }
  }
  async componentDidUpdate() {
    await AsyncStorage.setItem(NAV_STORE_KEY, JSON.stringify(this.state.nav));
    console.log(this.state.nav);
  }
  render() {
    if (!this.state.nav) {
      return null;
    }
    return (
      <View style={{ paddingTop: APP_TOP_PADDING, flex: 1 }}>
        <AppNavigator
          navigation={addNavigationHelpers({
            state: this.state.nav,
            dispatch: this.dispatch
          })}
        />
      </View>
    );
  }
  dispatch = action => {
    const nav = AppNavigator.router.getStateForAction(action, this.state.nav);
    if (nav !== this.state.nav) {
      this.setState({ nav });
      return true;
    }
    return false;
  };
}

export default App;
