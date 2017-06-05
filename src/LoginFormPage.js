import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const LoginFormPage = CreateSmallFormPage({
  submitButtonLabel: "Sign in",
  title: "Login",
  heading: "Login to Aven",
  successNavigationAction: { uri: "/" },
  inputs: [
    {
      type: "text",
      name: "username",
      label: "Username, Email, or Phone #"
    },
    {
      type: "password",
      name: "password",
      label: ["Password"],
      rightLabel: () => ["Forgot? ", <a href="#">Click here to reset</a>]
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
