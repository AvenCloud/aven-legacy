import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const CreateFormPage = CreateSmallFormPage({
  submitButtonLabel: "Create",
  title: "Create",
  heading: "New Project",
  successNavigationAction: input => ({
    uri: "/" + input.projectName
  }),
  inputs: [
    {
      type: "text",
      name: "projectName",
      placeholder: "Project Name"
    }
  ],
  getActionForInput: state => ({ type: "CreateProjectAction", ...state }),
  validate: state => {
    if (!state.projectName) {
      return "Must provide a project name";
    }
    return null;
  }
});

export default CreateFormPage;
