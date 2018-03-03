({ React, Form, Alert, Agent, Page, Title, Text, Cookie, Link }) => {
  class RegisterForm extends React.Component {
    state = { pendingRegistration: null };
    render() {
      const { pendingRegistration } = this.state;
      if (pendingRegistration) {
        return (
          <React.Fragment>
            <Text>
              We've sent a verification code to {pendingRegistration.email}.
            </Text>
            <Form
              fields={[{ label: "Verification Code", name: "code" }]}
              onSubmit={async data => {
                const res = await Agent.dispatch({
                  type: "AuthVerifyAction",
                  userID: pendingRegistration.userID,
                  authID: pendingRegistration.email,
                  ...data,
                });
                if (!res.authID === pendingRegistration.email) {
                  Alert("Verification Error " + JSON.stringify(res));
                  return;
                }
                const loginRes = await Agent.dispatch({
                  type: "AuthLoginAction",
                  userID: pendingRegistration.userID,
                  password: pendingRegistration.password,
                });
                if (!loginRes.session) {
                  Alert("Login Error " + JSON.stringify(res));
                  return;
                }
                await Cookie.set("authUserID", pendingRegistration.userID);
                await Cookie.set("authSession", loginRes.session);
                Agent.setSession(pendingRegistration.userID, loginRes.session);
                Link.goTo("/");
              }}
            />
          </React.Fragment>
        );
      }
      return (
        <Form
          fields={[
            { label: "Display Name", name: "displayName" },
            { label: "Username", name: "userID" },
            { label: "Password", name: "password" },
            { label: "Email", name: "email" },
          ]}
          onSubmit={async data => {
            const res = await Agent.dispatch({
              type: "AuthRegisterAction",
              ...data,
            });
            if (res.userID && res.authID) {
              this.setState({
                pendingRegistration: {
                  ...res,
                  ...data,
                },
              });
              return;
            }
            Alert("Registration Error " + JSON.stringify(res));
          }}
        />
      );
    }
  }
  class RegisterPage extends React.Component {
    static title = "Aven";
    render() {
      return (
        <Page title="Aven | Register">
          <Title>Register</Title>
          <RegisterForm />
        </Page>
      );
    }
  }
  return RegisterPage;
};
