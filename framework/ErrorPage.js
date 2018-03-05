({ React, Page, View, Title, StyleSheet, Colors, Text, Button }) => {
  class ErrorPage extends React.Component {
    render() {
      const { title, error, onRetry } = this.props;
      let message = error.message;
      if (!message) {
        message = JSON.stringify(error);
      }
      return (
        <Page title={title}>
          <Title>Error!</Title>
          <Text>{message}</Text>
          <Button label="Retry" onPress={onRetry} />
        </Page>
      );
    }
  }

  const styles = StyleSheet.create({});
  return ErrorPage;
};
