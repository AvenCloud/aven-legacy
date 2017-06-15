import React from "react";

import ReactComponentHandleForm from "./ReactComponentHandleForm";
import LoginFormPage from "./LoginFormPage";
import RegisterFormPage from "./RegisterFormPage";
import ComingSoonPage from "./ComingSoonPage";
import VerifyFormPage from "./VerifyFormPage";
import HomePage from "./HomePage";
import ResetPasswordPage from "./ResetPasswordPage";

const NavigationActions = {
  NavigateResetAction: {
    path: "/auth/reset",
    handler: ReactComponentHandleForm,
    component: ResetPasswordPage
  },
  NavigateHomeAction: {
    path: "/",
    component: HomePage
  },
  NavigateLoginAction: {
    path: "/auth/login",
    handler: ReactComponentHandleForm,
    component: LoginFormPage
  },
  NavigateRegisterAction: {
    path: "/auth/register",
    handler: ReactComponentHandleForm,
    component: RegisterFormPage
  },
  NavigateVerifyAction: {
    path: "/auth/verify",
    handler: ReactComponentHandleForm,
    component: VerifyFormPage
  },

  NotFoundAction: {
    component: ComingSoonPage
  }
};

export default NavigationActions;
