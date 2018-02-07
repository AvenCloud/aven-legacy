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
}) => {
  class MembersList extends React.Component {
    render() {
      return <Title>11111MembersList</Title>;
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
        <AppContainer title="Team Page">
          <Title>{JSON.stringify(this.props.status)}</Title>
          <LoadingContainer
            recordID="Team"
            render={record => <MembersList members={record} />}
          />
          <JoinForm />
        </AppContainer>
      );
    }
  }
  return TestApp;
};
