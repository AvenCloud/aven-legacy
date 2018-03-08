({
  React,
  Form,
  Alert,
  Agent,
  Page,
  Title,
  Text,
  AuthLoginAction,
  AuthVerifyAction,
  AuthRegisterAction,
  GetSessionAction,
  Cookie,
  Link,
}) => {
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
                const res = await AuthVerifyAction({
                  userID: pendingRegistration.userID,
                  authID: pendingRegistration.email,
                  ...data,
                });
                if (!res.authID === pendingRegistration.email) {
                  Alert("Verification Error " + JSON.stringify(res));
                  return;
                }
                const sessionRes = await Agent.dispatch({
                  type: "GetSessionAction",
                });
                if (!sessionRes) {
                  const loginRes = await AuthLoginAction({
                    userID: pendingRegistration.userID,
                    password: pendingRegistration.password,
                  });
                  if (!loginRes.session) {
                    Alert("Login Error " + JSON.stringify(res));
                    return;
                  }
                }

                Link.goTo("/");
              }}
            />
          </React.Fragment>
        );
      }
      return (
        <Form
          fields={[
            { label: "Display Name", name: "displayName", type: "name" },
            { label: "Username", name: "userID", type: "text" },
            { label: "Password", name: "password", type: "password" },
            { label: "Email", name: "email", type: "email" },
          ]}
          onSubmit={async data => {
            const res = await AuthRegisterAction(data);

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
    async componentDidMount() {
      const session = await GetSessionAction();
      if (session) {
        Link.goTo("/");
      }
    }
  }
  return RegisterPage;
};
