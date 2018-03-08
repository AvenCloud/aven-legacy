({ Agent, Form, Text, React, Page, Alert }) => {
  class DispatchDemo extends React.Component {
    static title = "Dispatch Demo";
    render() {
      return (
        <Page>
          <Text>Dispatch Action</Text>
          <Form
            fields={[{ name: "action", label: "Action JSON", type: "json" }]}
            onSubmit={async data => {
              Alert(data.action);
              // const result = await Agent.dispatch(JSON.parse(data.action));
              // Alert(`Result is ${JSON.stringify(result)}`);
            }}
          />
        </Page>
      );
    }
  }

  return DispatchDemo;
};
