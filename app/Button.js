({ React, Platform, _npm_react_native }) => {
  class Button extends React.Component {
    render() {
      if (Platform.web) {
        return <button onClick={this.props.onPress}>{this.props.label}</button>;
      } else {
        const { TouchableOpacity, Text } = _npm_react_native;
        return (
          <TouchableOpacity onPress={this.props.onPress}>
            <Text>{this.props.label}</Text>
          </TouchableOpacity>
        );
      }
    }
  }
  return Button;
};
