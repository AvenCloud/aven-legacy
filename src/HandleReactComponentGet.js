import React from "react";
import { renderToString } from "react-dom/server";
import AppPage from "./AppPage";
import DispatchAction from "./DispatchAction";

export default async function ReactComponentHandleGet(
  req,
  res,
  next,
  navAction
) {
  const Component = navAction.component;
  if (req.method === "GET") {
    const { auth, params, path } = req;
    let data = null;
    if (Component.load) {
      try {
        data = await Component.load({ auth, params, path }, action =>
          DispatchAction({
            ...action,
            viewerUser: auth && auth.user,
            viewerSession: auth && auth.session
          })
        );
      } catch (e) {
        console.error("duh1", e);
        next();
        return;
      }
    }
    const pageProps = { auth, params, data };
    const title = AppPage.getTitle(Component.getTitle(pageProps));
    const script = Component.browserModule;
    res.send(
      renderToString(
        <AppPage title={title} script={script}>
          <Component {...pageProps} />
        </AppPage>
      )
    );
    return;
  }
  res.status(405).send();
}
