({
  React,
  Team,
  Title,
  Form,
  Alert,
  Agent,
  Button,
  AppContainer,
  LoadingContainer,
  Platform,
  View,
}) => {
  class MembersList extends React.Component {
    render() {
      return <Title>Ok, just a bit!</Title>;
    }
  }
  class JoinForm extends React.Component {
    state = { name: "" };
    render() {
      return (
        <Form
          fields={[{ name: "name", type: "string", label: "Your name:" }]}
          onSubmit={this._onSubmit}
        />
      );
    }
    _onSubmit = fields => {
      // Agent.dispatch...
    };
  }
  class TestApp extends React.Component {
    render() {
      return (
        <AppContainer title="Aven">
          <Title>Welcome to Aven</Title>
          <View style={{ borderWidth: 3 }}>
            <LoadingContainer
              recordID="Team"
              render={record => <MembersList members={record} />}
            />
          </View>

          <JoinForm />
        </AppContainer>
      );
    }
  }
  return TestApp;
};
