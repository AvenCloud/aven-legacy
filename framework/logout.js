({ React, Page, Title, AuthLogoutAction, Link, Text }) => {
  class LogoutPage extends React.Component {
    static title = "Aven | Logout";
    render() {
      return (
        <Page title="Aven | Logout">
          <Title>Logout</Title>
          <Text>Logging you out..</Text>
        </Page>
      );
    }
    async componentDidMount() {
      await AuthLogoutAction();
      Link.goTo("/");
    }
  }
  return LogoutPage;
};
