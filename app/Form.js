({ React, Platform, _npm_react_native }) => {
  class Form extends React.Component {
    render() {
      if (Platform.web) {
        return (
          <div>
            {this.props.children} {this.props.fields.length}
          </div>
        );
      } else {
        const { View } = _npm_react_native;
        const { Text } = _npm_react_native;

        return (
          <View>
            <Text>{this.props.fields.length}</Text>
          </View>
        );
      }
    }
  }
  return Form;
};
