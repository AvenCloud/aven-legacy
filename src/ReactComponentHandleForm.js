import React from "react";
import { renderToString } from "react-dom/server";
const handleBodyParser = require("body-parser").urlencoded({ extended: false });
import AppPage from "./AppPage";
import DispatchAction from "./DispatchAction";

export default function ReactComponentHandleForm(Component) {
  return (req, res) => {
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
          const actionResult = DispatchAction(action)
            .then(result => ({ state: "passed", result }))
            .catch(result => ({ state: "rejected", result }))
            .then(data => {
              console.log("Dispatch result from form post:");
              console.log(JSON.stringify(data, null, 2));
              if (
                data.state === "passed" &&
                Component.successNavigationAction &&
                Component.successNavigationAction.uri
              ) {
                return res.redirect(Component.successNavigationAction.uri);
              }
              if (data.state === "rejected") {
                res.send(
                  renderToString(
                    <AppPage title={AppPage.getTitle(Component.getTitle())}>
                      <Component
                        input={input}
                        validationError={JSON.stringify(data.result)}
                      />
                    </AppPage>
                  )
                );
                return;
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
  };
}
