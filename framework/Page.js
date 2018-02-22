({ React, AppContainer, View, StyleSheet }) => {
  class Page extends React.Component {
    render() {
      const { title } = this.props;
      return (
        <AppContainer title={title}>
          <View style={{}}>{this.props.children}</View>
        </AppContainer>
      );
    }
  }
  return Page;
};
