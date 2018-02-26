({ React, Form, Alert, Agent, Page, Title }) => {
  class RegisterPage extends React.Component {
    static title = "Aven";
    render() {
      return (
        <Page title="Aven | Register">
          <Title>Register</Title>
          <Form
            fields={[
              { label: "Display Name", name: "displayName" },
              { label: "Username", name: "id" },
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
        </Page>
      );
    }
  }
  return RegisterPage;
};
