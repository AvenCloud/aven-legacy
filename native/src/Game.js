/**
 * @flow
 */

import React, { Component } from "react";
import { View, Text, Image } from "react-native";

class AlienGameComponent extends Component {
  static ZTypes: ZTypeMap = {
    name: { type: "string" },
    color: ["red", "blue", "green"],
  };
  render() {
    let { name, color } = this.props;
    name = name || "Unnamed Alien";
    color = color || "red";
    return (
      <View style={{ width: 187, alignSelf: 'center' }}>
        <Image
          style={{
            tintColor: color || "red",
            // position: "absolute",
            width: 187,
            height: 263
          }}
          source={require("../assets/alien-head.png")}
        />
        <Text style={{ textAlign: 'center', color }}>{name}</Text>
      </View>
    );
  }
}



class KitchenSinkTypeComponent extends Component {
  static ZTypes: ZTypeMap = {
    name: { type: "string" },
    chooseLiterals: ["red", "blue", "green", true, 0.5],
    width: { type: 'number' },
    isThisThingOn: { type: 'boolean' },
    strOrFifteen: [{ type: 'string' }, 15]
  };
  render() {
    return <Text>{JSON.stringify(this.props)}</Text>;
  }
}

const GameComponents = {
  Alien: AlienGameComponent,
  KitchenSink: KitchenSinkTypeComponent
};

const GameChapters = [
  {
    title: "Hello game",
    description: "Make an alien named Razzle",
    components: ["Alien"],
    getError: chapter => {
      const aliens = chapter.components;
      if (aliens.length === 0) {
        return "You haven't added any aliens!";
      }
      if (aliens.length > 1) {
        return "Too many aliens!";
      }
      if (aliens[0].name !== 'Razzle') {
        return "The alien is not named Razzle!";
      }
      return null;
    },
  },
  {
    title: "Advanced game",
    description: "This is how you get started",
    components: Object.keys(GameComponents),
    getError: chapter => {
      return "This chapter is literally impossible. Have fun!"
    }
  }
];

export { GameChapters, GameComponents };
