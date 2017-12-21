import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const LoginFormPage = CreateSmallFormPage({
  submitButtonLabel: "Sign in",
  title: "Login",
  heading: "Welcome back!",
  successNavigationAction: { uri: "/" },
  inputs: [
    {
      type: "text",
      name: "username",
      placeholder: "Username, Email, or Phone #",
      rightLabel: () => [
        "Need an account? ",
        <a href="/auth/register" key="a">
          Register here
        </a>
      ]
    },
    {
      type: "password",
      name: "password",
      placeholder: "Password",
      rightLabel: () => [
        "Forgot? ",
        <a href="/auth/reset" key="a">
          Reset password here
        </a>
      ]
    }
  ],
  getActionForInput: state => ({ type: "AuthLoginAction", ...state }),
  validate: state => {
    if (!state.password || !state.username) {
      return "Must provide both the username and the password";
    }
    return null;
  }
});

export default LoginFormPage;
