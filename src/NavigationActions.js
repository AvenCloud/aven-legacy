import React from "react";

import HandleReactComponentForm from "./HandleReactComponentForm";
import LoginFormPage from "./LoginFormPage";
import RegisterFormPage from "./RegisterFormPage";
import ComingSoonPage from "./ComingSoonPage";
import VerifyFormPage from "./VerifyFormPage";
import HomePage from "./HomePage";
import ResetPasswordPage from "./ResetPasswordPage";
import HandleLogout from "./HandleLogout";
import CreateFormPage from "./CreateFormPage";
import ProjectPage from "./ProjectPage";
import ProfilePage from "./ProfilePage";

const NavigationActions = {
  NavigateResetAction: {
    path: "/auth/reset",
    handler: HandleReactComponentForm,
    component: ResetPasswordPage
  },
  NavigateHomeAction: {
    path: "/",
    component: HomePage
  },
  NavigateLogoutAction: {
    path: "/auth/logout",
    handler: HandleLogout
  },
  NavigateCreateAction: {
    path: "/create",
    handler: HandleReactComponentForm,
    component: CreateFormPage
  },
  NavigateLoginAction: {
    path: "/auth/login",
    handler: HandleReactComponentForm,
    component: LoginFormPage
  },
  NavigateRegisterAction: {
    path: "/auth/register",
    handler: HandleReactComponentForm,
    component: RegisterFormPage
  },
  NavigateVerifyAction: {
    path: "/auth/verify",
    handler: HandleReactComponentForm,
    component: VerifyFormPage
  },
  NotFoundAction: {
    component: ComingSoonPage
  },
  NavigateProjectAction: {
    path: "/:user/:project",
    component: ProjectPage
  },
  NavigateProfileAction: {
    path: "/:user",
    component: ProfilePage
  }
};

export default NavigationActions;
