({ React, Platform, View, StyleSheet, Agent }) => {
  class AppContainer extends React.Component {
    render() {
      if (Platform.web) {
        return (
          <View style={StyleSheet.absoluteFill}>{this.props.children}</View>
        );
      } else {
        return this.props.children;
      }
    }
  }
  return AppContainer;
};
