({ React, AppContainer, View, StyleSheet }) => {
  class Page extends React.Component {
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
            <View style={{ maxWidth: 500, borderWidth: 2 }}>
              {this.props.children}
            </View>
          </View>
        </AppContainer>
      );
    }
  }
  return Page;
};
