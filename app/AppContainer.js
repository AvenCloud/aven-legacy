({ React, Platform, View, StyleSheet, Agent }) => {
  class AppContainer extends React.Component {
    render() {
      if (Platform.webServer) {
        return (
          <html>
            <head>
              <link rel="stylesheet" href="/assets/normalize.css" />
              <link rel="stylesheet" href="/assets/app.css" />
              <title>{this.props.title || "Aven"}</title>
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.avenEnv = ${JSON.stringify(Agent.env)};`,
                }}
              />
            </head>
            <body>
              <div id="root">{this.props.children}</div>
              <script type="text/javascript" src="/_client_app.js" />
            </body>
          </html>
        );
      } else if (Platform.web) {
        return (
          <View style={StyleSheet.absoluteFill}>{this.props.children}</View>
        );
      } else {
        return this.props.children;
      }
    }
  }
  return AppContainer;
};
