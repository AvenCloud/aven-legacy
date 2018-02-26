({ React, Platform, _npm_react_native, _npm_react_native_web }) => {
  if (_npm_react_native) {
    return _npm_react_native.ScrollView;
  }
  if (_npm_react_native_web) {
    return _npm_react_native_web.ScrollView;
  }
  return null;
};
