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
        <a href="/auth/register">Register here</a>
      ]
    },
    {
      type: "password",
      name: "password",
      placeholder: "Password",
      rightLabel: () => [
        "Forgot? ",
        <a href="/auth/reset">Reset password here</a>
      ]
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

export default LoginFormPage;
