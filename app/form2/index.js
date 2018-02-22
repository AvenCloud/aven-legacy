({ Form, React, Alert, Agent, Page, Touchable, Test, Zoom, Markdown }) => {
  class TestApp extends React.Component {
    static title = "Aven";

    render() {
      return (
        <Page title="Aven">
          <Form
            fields={[
              { label: `Display Name ${Test.length} `, name: "displayName" },
              { label: Zoom.value, name: "id" },
              { label: "Password", name: "password" },
              { label: "Email", name: "email" },
            ]}
            onSubmit={async data => {
              const res = await Agent.dispatch({
                type: "AuthRegisterAction",
                ...data,
              });
              Alert(JSON.stringify(res));
            }}
          />
          <Markdown content="# Hello there!" />
        </Page>
      );
    }
    // <LoadingContainer
    //   record="color"
    //   render={(color, onColor) => (
    //     <Touchable
    //       feedback="highlight"
    //       style={{
    //         width: 100,
    //         height: 100,
    //         borderWidth: 5,
    //         backgroundColor: color ? "blue" : "red",
    //       }}
    //       onPress={() => {
    //         onColor(!color);
    //       }}
    //     />
    //   )}
    // />
  }
  return TestApp;
};
