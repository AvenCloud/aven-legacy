({ React, Platform, _npm_react_native }) => {
  const Alert = msg => {
    if (Platform.mobile) {
      const { Alert } = _npm_react_native;
      Alert.alert(msg);
    } else if (Platform.webBrowser) {
      global.alert(msg);
    }
  };
  return Alert;
};
