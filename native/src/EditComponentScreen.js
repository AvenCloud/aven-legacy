/**
 * @flow
 */

import React, { Component } from "react";
import { Text, View } from "react-native";
import { List, ListItem, ButtonGroup } from "react-native-elements";
import { GameComponents, GameChapters } from "./Game";
import { WithZed } from "./ZedStore";

function isTypeOrOfLiterals(typeDef) {
  if (!typeDef instanceof Array) {
    return false;
  }
  let hasOnlyLiterals = true;
  typeDef.forEach(t => {
    if (
      !(typeof t === "string" ||
        typeof t === "boolean" ||
        typeof t === "number")
    ) {
      hasOnlyLiterals = false;
    }
  });
  return hasOnlyLiterals;
}

class PropEditor extends Component {
  render() {
    const {
      chapterState,
      navigation,
      context,
      propTypeDef,
      propTypeName,
      thisComponent,
      onValue
    } = this.props;
    const currentValue = thisComponent[propTypeName];
    if (propTypeDef.type === "string") {
      return (
        <ListItem
          hideChevron={true}
          textInput={true}
          title={propTypeName}
          textInputValue={currentValue}
          textInputOnChangeText={onValue}
        />
      );
    }
    if (propTypeDef.type === "number") {
      const numDisplay = currentValue == null ? "" : "" + currentValue;
      return (
        <ListItem
          hideChevron={true}
          textInput={true}
          textInputPlaceholder="duh"
          title={propTypeName}
          textInputValue={numDisplay}
          textInputKeyboardType="numeric"
          textInputOnChangeText={txt => {
            if (txt === "") {
              return onValue(null);
            }
            const num = Number(txt);
            if (!Number.isNaN(num)) {
              onValue(num);
            }
          }}
        />
      );
    }
    if (propTypeDef.type === "boolean") {
      return (
        <ListItem
          hideChevron={true}
          switchButton={true}
          title={propTypeName}
          switched={thisComponent[propTypeName]}
          onSwitch={onValue}
        />
      );
    }
    if (isTypeOrOfLiterals(propTypeDef)) {
      let selectedIndex = null;
      propTypeDef.forEach((tt, index) => {
        if (thisComponent[propTypeName] === tt) {
          selectedIndex = index;
        }
      });
      return (
        <ListItem
          hideChevron={true}
          title={propTypeName}
          label={
            <View style={{ flex: 1 }}>
              <ButtonGroup
                selectedIndex={selectedIndex}
                onPress={index => onValue(propTypeDef[index])}
                buttons={propTypeDef.map(tt => <Text>{"" + tt}</Text>)}
              />
            </View>
          }
        />
      );
    }
    return (
      <ListItem
        key={propTypeName}
        title={propTypeName}
        label={<Text>Coming Soon</Text>}
        hideChevron={true}
      />
    );
  }
}

class EditComponentScreenWithState extends Component {
  static navigationOptions = {
    title: "Edit Component"
  };
  render() {
    const { chapterState, navigation, setChapterState } = this.props;
    const { state, goBack } = navigation;
    const { chapterIndex, context } = state.params;
    const chapter = GameChapters[chapterIndex];
    const { components } = chapterState;
    let thisComponent = chapterState;
    context.forEach(contextName => {
      thisComponent = thisComponent.components.find(c => c.key === contextName);
    });
    const cType = thisComponent.type;
    const gameComponent = GameComponents[cType];
    const zTypes = gameComponent.ZTypes;
    return (
      <List>
        {Object.keys(zTypes).map(propType => {
          const propTypeDef = zTypes[propType];
          return (
            <PropEditor
              key={propType}
              navigation={navigation}
              context={context}
              propTypeDef={propTypeDef}
              propTypeName={propType}
              chapter={chapter}
              chapterIndex={chapterIndex}
              chapterState={chapterState}
              thisComponent={thisComponent}
              onValue={newPropValue => {
                const newComponents = chapterState.components.slice();
                const componentIndex = newComponents.indexOf(thisComponent);
                newComponents[componentIndex] = {
                  ...thisComponent,
                  [propType]: newPropValue
                };
                setChapterState(chapterIndex, {
                  ...chapterState,
                  components: newComponents
                });
              }}
            />
          );
        })}
      </List>
    );
  }
}
const EditComponentScreen = WithZed(EditComponentScreenWithState);

export default EditComponentScreen;
