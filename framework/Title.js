({ React, Platform, Alert, View, Button, Text, TextInput, StyleSheet }) => {
  class Title extends React.Component {
    render() {
      return (
        <View style={{ padding: 30 }}>
          <Text style={{ fontSize: 28 }}>{this.props.children}</Text>
        </View>
      );
    }
  }
  return Title;
};
