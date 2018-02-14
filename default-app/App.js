({ React, AppContainer, View, Text, StyleSheet }) => {
  class App extends React.Component {
    render() {
      const { title } = this.props;
      return (
        <AppContainer title={title}>
          <View
            style={{
              flex: 1,
              borderWidth: 2,
              borderColor: "red",
            }}
          >
            <Text style={{ color: "blue" }}>Hello, world!</Text>
          </View>
        </AppContainer>
      );
    }
  }
  return App;
};
