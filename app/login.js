({ React, Form, Alert, Agent, Page, Title }) => {
  class RegisterPage extends React.Component {
    static title = "Aven";
    render() {
      return (
        <Page title="Aven | Login">
          <Title>Login</Title>
          <Form
            fields={[
              { label: "Username", name: "userID" },
              { label: "Password", name: "password" },
            ]}
            onSubmit={async data => {
              const res = await Agent.dispatch({
                type: "AuthLoginAction",
                ...data,
              });
              Alert(JSON.stringify(res));
            }}
          />
        </Page>
      );
    }
  }
  return RegisterPage;
};
