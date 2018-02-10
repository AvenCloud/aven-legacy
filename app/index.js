({
  React,
  Title,
  Form,
  Alert,
  Agent,
  Image,
  Page,
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
  class CommentForm extends React.Component {
    state = { name: "" };
    render() {
      return (
        <Form
          fields={[
            { name: "name", type: "string", label: "Your name:" },
            { name: "content", type: "string", label: "Comment:" },
          ]}
          onSubmit={this._onSubmit}
        />
      );
    }
    _onSubmit = fields => {
      Alert("Hi " + JSON.stringify(fields));

      // Agent.dispatch...
    };
  }
  class TestApp extends React.Component {
    render() {
      return (
        <Page title="Aven">
          <Title>Welcome to Aven</Title>
          <Image
            style={{ width: 50, height: 50 }}
            source={{
              uri:
                "https://media2.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
            }}
          />
          <LoadingContainer
            recordID="TestComments"
            render={record => <MembersList members={record} />}
          />

          <CommentForm />
        </Page>
      );
    }
  }
  return TestApp;
};
