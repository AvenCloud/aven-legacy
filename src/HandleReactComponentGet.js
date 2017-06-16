import React from "react";
import { renderToString } from "react-dom/server";
import AppPage from "./AppPage";

export default function ReactComponentHandleGet(req, res, navAction) {
  const Component = navAction.component;
  if (req.method === "GET") {
    const title = AppPage.getTitle(Component.getTitle());
    const { authenticatedUser } = req;
    res.send(
      renderToString(
        <AppPage title={title}>
          <Component authenticatedUser={authenticatedUser} />
        </AppPage>
      )
    );
    return;
  }
  res.status(405).send();
}
