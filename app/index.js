({ React, Team, Title, Alert, Agent, Button, AppContainer, Platform }) => {
  class TestApp extends React.Component {
    render() {
      return (
        <AppContainer title="mother">
          <Title>members!</Title>
          <Button
            label="PressMe"
            onPress={async () => {
              const a = await Agent.dispatch({
                type: "GetRecordAction",
                recordID: "App",
              });
              Alert(JSON.stringify(a));
            }}
          />
        </AppContainer>
      );
    }
  }
  return TestApp;
};
