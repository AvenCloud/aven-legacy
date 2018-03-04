({ React, Form, Alert, AuthLoginAction, Page, Title, Link }) => {
  class RegisterPage extends React.Component {
    static title = "Aven";
    render() {
      return (
        <Page title="Aven | Login">
          <Title>Login</Title>
          <Form
            fields={[
              { label: "Username", name: "userID", type: "text" },
              { label: "Password", name: "password", type: "password" },
            ]}
            onSubmit={async data => {
              const res = await AuthLoginAction({
                ...data,
              });
              if (res.authID === data.authID) {
                Link.goTo("/");
                return;
              }
              Alert(JSON.stringify(res));
            }}
          />
        </Page>
      );
    }
  }
  return RegisterPage;
};
