({ React, Touchable, Text, View, StyleSheet, Platform, Colors }) => {
  class Button extends React.Component {
    render() {
      return (
        <View style={styles.container}>
          <Touchable
            style={styles.button}
            onPress={this.props.onPress}
            feedback="opacity"
          >
            <Text style={styles.text}>{this.props.label}</Text>
          </Touchable>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 3,
    },
    button: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 3,
      backgroundColor: Colors.primary,
      ...(Platform.os === "android"
        ? {
            elevation: 4,
            borderRadius: 2,
          }
        : {}),
    },
    text: {
      color: Colors.white,
      fontSize: 16,
      textAlign: "center",
      padding: 8,
      ...(Platform.os === "android"
        ? {
            fontWeight: "500",
          }
        : {
            fontSize: 18,
          }),
    },
    iconContainer: {
      marginHorizontal: 5,
    },
  });

  return Button;
};
