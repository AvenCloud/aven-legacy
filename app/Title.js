({ React, Platform, _npm_react_native }) => {
  class Title extends React.Component {
    render() {
      if (Platform.web) {
        return <h1>{this.props.children}</h1>;
      } else {
        const { Text } = _npm_react_native;
        return <Text>{this.props.children}</Text>;
      }
    }
  }
  return Title;
};
