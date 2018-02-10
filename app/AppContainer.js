({ React, Platform, View, StyleSheet }) => {
  class AppContainer extends React.Component {
    render() {
      if (Platform.webServer) {
        return (
          <html>
            <head>
              <link rel="stylesheet" href="/assets/normalize.css" />
              <link rel="stylesheet" href="/assets/app.css" />
              <title>{this.props.title || "Aven"}</title>
              <script>{}</script>
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
