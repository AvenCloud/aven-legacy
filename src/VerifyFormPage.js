import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const LoginFormPage = CreateSmallFormPage({
  submitButtonLabel: "Verify",
  title: "Verify",
  heading: "Verification",
  successNavigationAction: { type: "NavigateHomeAction" },
  inputs: [
    {
      type: "text",
      name: "username",
      label: "Username"
    },
    {
      type: "text",
      name: "code",
      label: ["Code that we sent you"]
    }
  ],
  getActionForInput: state => ({ type: "AuthVerifyAction", ...state }),
  validate: state => {
    if (!state.username || !state.code) {
      return "Must provide both the username and the validation code";
    }
    return null;
  }
});

export default LoginFormPage;
