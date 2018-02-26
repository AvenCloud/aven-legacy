({ React, AppContainer, View, StyleSheet, Platform, ScrollView, Colors }) => {
  class Page extends React.Component {
    render() {
      const { title } = this.props;
      const InnerView = Platform.web ? View : ScrollView;
      return (
        <AppContainer title={title} style={styles.container}>
          <View style={styles.innerPage}>
            <InnerView style={styles.scrollContainer}>
              {this.props.children}
            </InnerView>
          </View>
        </AppContainer>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors.bgWash,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    innerPage: {
      maxWidth: 475,
      padding: 10,
      backgroundColor: "white",
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: "#CCCCDD",
    },
    scrollContainer: {
      paddingTop: 20,
    },
  });
  return Page;
};
