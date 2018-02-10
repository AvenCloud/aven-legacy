({ React, Platform, View, _npm_react_native, _npm_react_native_web }) => {
  const ReactNativeIsh = _npm_react_native || _npm_react_native_web;
  const {
    TouchableWithoutFeedback,
    TouchableOpacity,
    TouchableHighlight,
  } = ReactNativeIsh;
  const getTouchableComponent = feedback => {
    switch (feedback) {
      case "opacity":
        return TouchableOpacity;
      case "none":
        return TouchableWithoutFeedback;
      case "highlight":
      default:
        return TouchableHighlight;
    }
  };
  return ({ feedback, onPress, children, style }) => {
    const Component = getTouchableComponent(feedback);
    const needViewToWrap = feedback === "opacity" || feedback === "none";
    return (
      <Component onPress={onPress}>
        <View style={style}>{children}</View>
      </Component>
    );
  };
};
