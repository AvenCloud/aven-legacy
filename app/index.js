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
  AsyncStorage,
}) => {
  const createStorageContainer = key => WrappedComponent => {
    class StorageContainer extends React.Component {
      state = {};
      async componentDidMount() {
        const data = await AsyncStorage.getItem(key);
        this.setState(JSON.parse(data));
      }
      _onData = async data => {
        this.setState(data);
        await AsyncStorage.setItem(key, JSON.stringify(data));
      };
      render() {
        return (
          <WrappedComponent
            data={this.state}
            onData={this._onData}
            {...this.props}
          />
        );
      }
    }
    return StorageContainer;
  };
  const countContainer = createStorageContainer("count");

  class Counter extends React.Component {
    render() {
      const count = this.props.data.count || 0;
      return (
        <Button
          onPress={() => {
            this.props.onData({ count: count + 1 });
          }}
          label={`Pressed ${count} asdf`}
        />
      );
    }
  }
  Counter = countContainer(Counter);

  class MembersList extends React.Component {
    render() {
      return <Title>{JSON.stringify(this.props.members)}</Title>;
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
          <Title>Welcome to not being entirely busted</Title>
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
          <Counter />

          <CommentForm />
        </Page>
      );
    }
  }
  return TestApp;
};
