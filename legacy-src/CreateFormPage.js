import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const CreateFormPage = CreateSmallFormPage({
  submitButtonLabel: "Create",
  title: "Create",
  heading: "New Project",
  successNavigationAction: ({
    input,
    auth,
    result
  }) => ({
    uri: "/" + auth.user + "/" + result.projectName
  }),
  inputs: [{
      type: "text",
      name: "projectName",
      placeholder: "Project Name"
    },
    {
      type: "checkbox",
      name: "isPublic",
      label: "Is public?",
      default: false
    }
  ],
  getActionForInput: state => ({
    type: "CreateRecordAction",
    ...state
  }),
  validate: state => {
    if (!state.projectName) {
      return "Must provide a project name";
    }
    return null;
  }
});

export default CreateFormPage;