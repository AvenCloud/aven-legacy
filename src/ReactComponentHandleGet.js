import React from "react";
import { renderToString } from "react-dom/server";
import AppPage from "./AppPage";

export default function ReactComponentHandleGet(Component) {
  return (req, res) => {
    if (req.method === "GET") {
      const title = AppPage.getTitle(Component.getTitle());
      res.send(renderToString(<AppPage title={title}><Component /></AppPage>));
      return;
    }
    res.status(405).send();
  };
}
