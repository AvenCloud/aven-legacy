import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const RegisterFormPage = CreateSmallFormPage({
  submitButtonLabel: "Verify and Join Aven",
  title: "Register",
  heading: "Welcome!",
  subheadingText: "How can we keep in touch?",
  successNavigationAction: { uri: "/auth/verify" },
  inputs: [
    {
      type: "text",
      name: "username",
      rightLabel: input => {
        if (input && input.length > 2) {
          return input + ".aven.io";
        }
        return <span style={{ color: "#777" }}>you.aven.io</span>;
      },
      placeholder: "Username"
    },
    {
      name: "email_or_phone",
      placeholder: "Email or Phone Number",
      type: "email-phone-signup"
    }
  ],
  getActionForInput: input => ({
    type: "AuthRegisterAction",
    name: input.username,
    email_or_phone: input.email_or_phone,
    // these are additional types that will (eventually) be outputted by the email-phone-signup input type:
    email: input.email,
    phone: input.phone
  }),
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

export default RegisterFormPage;
