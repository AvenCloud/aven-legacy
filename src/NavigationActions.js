import React from "react";

import LoginFormPage from "./LoginFormPage";
import RegisterFormPage from "./RegisterFormPage";
import ComingSoonPage from "./ComingSoonPage";
import VerifyFormPage from "./VerifyFormPage";
import HomePage from "./HomePage";
import ResetPasswordPage from "./ResetPasswordPage";
import CreateFormPage from "./CreateFormPage";
import ProjectPage from "./ProjectPage";
import ProfilePage from "./ProfilePage";
import AccountPage from "./AccountPage";

const NavigationActions = {
  NavigateAccountAction: {
    path: "/account",
    component: AccountPage
  },
  NavigateResetAction: {
    path: "/auth/reset",
    handler: "form",
    component: ResetPasswordPage
  },
  NavigateHomeAction: {
    path: "/",
    component: HomePage
  },
  NavigateLogoutAction: {
    path: "/auth/logout",
    handler: "logout"
  },
  NavigateCreateAction: {
    path: "/create",
    handler: "form",
    component: CreateFormPage
  },
  NavigateLoginAction: {
    path: "/auth/login",
    handler: "form",
    component: LoginFormPage
  },
  NavigateRegisterAction: {
    path: "/auth/register",
    handler: "form",
    component: RegisterFormPage
  },
  NavigateVerifyAction: {
    path: "/auth/verify",
    handler: "form",
    component: VerifyFormPage
  },
  NavigateProjectAction: {
    path: "/:user/:project*",
    component: ProjectPage
  },
  NavigateProfileAction: {
    path: "/:user",
    component: ProfilePage
  }
};

export default NavigationActions;
