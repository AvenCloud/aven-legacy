import React from "react";
import { renderToString } from "react-dom/server";
const handleBodyParser = require("body-parser").urlencoded({ extended: false });
import AppPage from "./AppPage";
import DispatchAction from "./DispatchAction";
import Configuration from "./Configuration";

const COOKIE_SETTINGS = { secure: Configuration.isSecure };

export default function ReactComponentHandleForm(req, res, next, navAction) {
  const Component = navAction.component;
  if (req.method === "GET") {
    const title = AppPage.getTitle(Component.getTitle());
    res.send(
      renderToString(
        <AppPage title={title}><Component input={req.query} /></AppPage>
      )
    );
    return;
  }
  if (req.method === "POST") {
    handleBodyParser(req, res, () => {
      const input = req.body;
      const validationError = Component.validate(input);
      if (validationError) {
        const title = AppPage.getTitle(Component.getTitle());
        res.send(
          renderToString(
            <AppPage title={title}>
              <Component validationError={validationError} input={input} />
            </AppPage>
          )
        );
        return;
      }
      const action = Component.getActionForInput(input);
      if (action) {
        const authAction = req.auth
          ? {
              ...action,
              viewerSession: req.auth.session,
              viewerUser: req.auth.user
            }
          : action;
        const actionResult = DispatchAction(authAction)
          .then(result => ({ state: "passed", result }))
          .catch(result => {
            console.error("fail", result);
            return { state: "rejected", result };
          })
          .then(resultData => {
            const { result } = resultData;

            console.log("Dispatch result from form post:");
            console.log(JSON.stringify(resultData, null, 2));

            if (
              resultData.state === "rejected" || resultData.state !== "passed"
            ) {
              res.send(
                renderToString(
                  <AppPage title={AppPage.getTitle(Component.getTitle())}>
                    <Component
                      input={input}
                      validationError={JSON.stringify(result)}
                    />
                  </AppPage>
                )
              );
              return;
            }

            if (
              action.type === "AuthVerifyAction" ||
              action.type === "AuthLoginAction"
            ) {
              res.cookie("user", result.username, COOKIE_SETTINGS);
              res.cookie("session", result.session, COOKIE_SETTINGS);
              res.redirect("/");
              return;
            }

            if (
              Component.successNavigationAction &&
              Component.successNavigationAction.uri
            ) {
              return res.redirect(Component.successNavigationAction.uri);
            }
            if (typeof Component.successNavigationAction === "function") {
              const navAction = Component.successNavigationAction({
                input,
                auth: req.auth
              });
              console.log("redirecting to", navAction);
              return res.redirect(navAction.uri);
            }

            res.send(
              renderToString(
                <AppPage title={AppPage.getTitle(Component.getTitle())}>
                  <Component
                    input={input}
                    validationError={
                      "Success! But we don't know how to handle it"
                    }
                  />
                </AppPage>
              )
            );
          });
      }
    });
    return;
  }
  res.status(405).send();
}
