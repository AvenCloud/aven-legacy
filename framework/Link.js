({ React, Platform, _npm_react_native, _npm_react_native_web }) => {
  if (_npm_react_native) {
    return _npm_react_native.Text;
  }
  if (Platform.web) {
    return ({ children, to }) => <a href={to}>{children}</a>;
  }
  return null;
};
