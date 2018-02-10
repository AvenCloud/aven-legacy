({ React, Touchable, Text, StyleSheet }) => {
  class Button extends React.Component {
    render() {
      return (
        <Touchable onPress={this.props.onPress}>
          <Text>{this.props.label}</Text>
        </Touchable>
      );
    }
  }

  const styles = StyleSheet.create({
    foo: {},
  });
  return Button;
};
