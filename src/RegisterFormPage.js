import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const RegisterFormPage = CreateSmallFormPage({
  submitButtonLabel: "Verify and Join Aven",
  title: "Register",
  heading: "Great to meet you!",
  subheadingText: "We're excited to build great things together",
  // "Before we get started, we'll need to make sure we can stay in touch.",
  successNavigationAction: { uri: "/auth/verify" },
  inputs: [
    {
      type: "text",
      name: "username",
      label: "Username",
      rightLabel: input => {
        if (input && input.length > 2) {
          return input + ".aven.io";
        }
        return <span style={{ color: "#777" }}>you.aven.io</span>;
      },
      placeholder: "What is your personal shortname/url?"
    },
    {
      name: "email_or_phone",
      placeholder: "How can we stay in touch?",
      label: "Email or Phone Number",
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
