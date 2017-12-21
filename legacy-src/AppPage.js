import React from "react";
import { renderToString } from "react-dom/server";

export default class AppPage extends React.Component {
  static getTitle = childTitle =>
    childTitle ? childTitle + " | Aven" : "Aven";
  render() {
    const { title, children, script, pageProps } = this.props;
    return (
      <html>
        <head>
          <link rel="stylesheet" href="/assets/bootstrap.css" />
          <link rel="stylesheet" href="/assets/Aven.css" />
          <title>{title}</title>
        </head>
        <body>
          <div
            id="aven-app"
            dangerouslySetInnerHTML={{ __html: renderToString(children) }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.pageProps = ${JSON.stringify(pageProps)};`
            }}
          />
          {script && <script src={`/assets/${script}.js`} />}
        </body>
      </html>
    );
  }
}
