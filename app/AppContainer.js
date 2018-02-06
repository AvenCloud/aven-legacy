({ Platform }) =>
  class AppContainer extends React.Component {
    render() {
      if (Platform.web) {
        return (
          <html>
            <head>
              <title>{this.props.title || "Aven"}</title>
              <script
                type="text/javascript"
                dangerouslySetInnerHTML={{ __html: `//alert('hi')` }}
              />
            </head>
            <body>{this.props.children}</body>
          </html>
        );
      } else {
        const { View } = _npm_react_native;

        return <View>{this.props.children}</View>;
      }
    }
  };
