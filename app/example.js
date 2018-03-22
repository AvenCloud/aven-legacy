({ React, AppContainer, View, Text, StyleSheet }) => {
  class App extends React.Component {
    static title = "Your new App";
    render() {
      return (
        <AppContainer>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Text style={{ textAlign: "center" }}>Hello, world!</Text>
          </View>
        </AppContainer>
      );
    }
  }
  return App;
};
