({ React, Platform, _npm_react_native }) => {
  class AppContainer extends React.Component {
    render() {
      if (Platform.webServer) {
        return (
          <html>
            <head>
              <title>{this.props.title || "Aven"}</title>
            </head>
            <body>
              <div id="root">{this.props.children}</div>
              <script type="text/javascript" src="/_client_app.js" />
            </body>
          </html>
        );
      } else if (Platform.web) {
        return this.props.children;
      }
      {
        const { View } = _npm_react_native;

        return <View>{this.props.children}</View>;
      }
    }
  }
  return AppContainer;
};
