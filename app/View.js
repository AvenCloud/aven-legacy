({ React, Platform, _npm_react_native, _npm_react_native_web }) => {
  class View extends React.Component {
    render() {
      if (_npm_react_native_web) {
        // Leave these implementations seperate for when hacks are needed for consistency
        const { View } = _npm_react_native_web;
        return <View {...this.props} />;
      } else if (_npm_react_native) {
        const { View } = _npm_react_native;
        return <View {...this.props} />;
      } else {
        return <div>{this.props.children}</div>;
      }
    }
  }
  return View;
};
