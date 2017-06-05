import React from "react";

export default class AppPage extends React.Component {
  static getTitle = childTitle =>
    childTitle ? childTitle + " | Aven" : "Aven";
  render() {
    const { title, children } = this.props;
    return (
      <html>
        <head>
          <link rel="stylesheet" href="/assets/bootstrap.css" />
          <link rel="stylesheet" href="/assets/Aven.css" />
          <title>{title}</title>
        </head>
        <body>{children}</body>
      </html>
    );
  }
}
