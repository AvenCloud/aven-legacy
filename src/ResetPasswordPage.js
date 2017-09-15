import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const LoginFormPage = CreateSmallFormPage({
  submitButtonLabel: "Send Reset Code",
  title: "Reset",
  heading: "Reset Password",
  successNavigationAction: { type: "NavigateHomeAction" },
  inputs: [
    {
      type: "text",
      name: "username_email_or_phone",
      label: "Username, email, or phone #"
    }
  ],
  getActionForInput: state => ({ type: "AuthResetAction", ...state }),
  validate: state => {
    if (!state.username_email_or_phone) {
      return "Must provide the username, email, or phone number";
    }
    return null;
  }
});

export default LoginFormPage;
