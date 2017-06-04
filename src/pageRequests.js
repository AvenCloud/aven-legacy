import React from "react";
import { renderToString } from "react-dom/server";
const handleBodyParser = require("body-parser").urlencoded({ extended: false });

function ReactComponentHandleForm(Component) {
  return (req, res) => {
    if (req.method === "GET") {
      const title = AppPage.getTitle(Component.getTitle());
      res.send(renderToString(<AppPage title={title}><Component /></AppPage>));
      return;
    }
    if (req.method === "POST") {
      console.log("posing what upp");
      handleBodyParser(req, res, () => {
        const input = req.body;
        const validationError = Component.validate(input);
        if (validationError) {
          const title = AppPage.getTitle(Component.getTitle());
          res.send(
            renderToString(
              <AppPage title={title}>
                <Component validationError={validationError} />
              </AppPage>
            )
          );
          return;
        }
        // things validated.. do something!
        res.send(
          renderToString(
            <AppPage title={AppPage.getTitle(Component.getTitle())}>
              <Component />
            </AppPage>
          )
        );
      });
      return;
    }
    res.setStatus(405).send();
  };
}

class AppPage extends React.Component {
  static getTitle = childTitle => "Great | " + childTitle;
  render() {
    const { title, children } = this.props;
    return (
      <html>

        <head>
          <link rel="stylesheet" href="/assets/bootstrap.css" />
          <title>{title}</title>
        </head>
        <body>{children}</body>
      </html>
    );
  }
}

const LoginFormPage = generateFormPage({
  submitButtonLabel: "Sign in",
  title: "Login",
  heading: "Login to Aven",
  successNavigationAction: { type: "NavigateHomeAction" },
  inputs: [
    {
      type: "text",
      name: "username",
      label: "Username, Email, or Phone Number"
    },
    {
      type: "password",
      name: "password",
      label: ["Password - ", <a href="#">Click here to reset</a>]
    }
  ],
  validate: state => {
    if (!state.password || !state.username) {
      return "Must provide both the username and the password";
    }
    if (state.password.length < 6) {
      return "Please choose a longer _password_";
    }
    return null;
  }
});

const RegisterFormPage = generateFormPage({
  submitButtonLabel: "Register",
  title: "Register",
  heading: "Register with Aven",
  successNavigationAction: { type: "NavigateHomeAction" },
  inputs: [
    {
      type: "text",
      name: "username",
      label: "Username"
    },
    {
      type: "text",
      name: "email",
      label: "Email"
    },
    {
      type: "text",
      name: "phoneNumber",
      label: "Phone Number"
    }
  ],
  validate: state => {
    if (!state.username) {
      return "Must provide the _username_";
    }
    if (!state.username) {
      return "Must provide either a _Phone Number_ or an _Email_";
    }
    return null;
  }
});

function generateFormPage(opts) {
  class FormPage extends React.Component {
    static successNavigationAction = opts.successNavigationAction;
    static getTitle = () => opts.title;
    static validate = opts.validate;
    render() {
      const { validationError } = this.props;
      return (
        <div style={{ width: 300, margin: "100px auto" }}>
          <div className="well">
            <form method="post">
              <h1 style={{ position: "relative", bottom: 15 }}>
                {opts.heading}
              </h1>

              {opts.inputs.map(inputConfig => {
                return (
                  <div className="form-group">
                    <label className="control-label" for={inputConfig.name}>
                      {inputConfig.label}
                    </label>
                    <input
                      className="form-control"
                      id={inputConfig.name}
                      name={inputConfig.name}
                      type={inputConfig.type}
                    />
                  </div>
                );
              })}

              {validationError &&
                <div className="alert alert-dismissible alert-danger">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>
                  <strong>Whoops!</strong> {validationError}
                </div>}

              <div
                className="form-group"
                style={{ position: "relative", top: 10 }}
              >
                <div
                  className="input-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column"
                  }}
                >
                  <button className="btn btn-primary btn-lg">
                    {opts.submitButtonLabel}
                  </button>

                </div>
              </div>

            </form>
          </div>
        </div>
      );
    }
  }
  return FormPage;
}

class ComingSoonPage extends React.Component {
  render() {
    return <h1>Coming Soon</h1>;
  }
}

function ReactComponentHandleGet(Component) {
  return (req, res) => {
    if (req.method === "GET") {
      const title = AppPage.getTitle(Component.getTitle());
      res.send(renderToString(<AppPage title={title}><Component /></AppPage>));
      return;
    }
    res.setStatus(405).send();
  };
}

const NavigationActions = {
  // NavigateHomeAction: {
  //   path: "/:userid",
  //   component: ComingSoonPage
  // },
  NavigateLoginAction: {
    path: "/login",
    handler: ReactComponentHandleForm,
    component: LoginFormPage
  },
  NavigateRegisterAction: {
    path: "/register",
    handler: ReactComponentHandleForm,
    component: RegisterFormPage
  },
  NavigateVerifyAction: {
    path: "/verify",
    component: ComingSoonPage
  }
};

export default function configureWebRoutes(app) {
  Object.keys(NavigationActions).forEach(actionName => {
    const { path, handler, component } = NavigationActions[actionName];
    const handlerToUse = handler || ReactComponentHandleGet;
    const runIt = handlerToUse(component);
    app.all(path, runIt);
  });
}
