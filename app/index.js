({ React, Team, Title, Platform, _npm_react_native }) => {
  class TestApp extends React.Component {
    render() {
      if (Platform.web) {
        return (
          <html>
            <head>
              <title>Aven</title>
              <script
                type="text/javascript"
                dangerouslySetInnerHTML={{ __html: `//alert('hi')` }}
              />
            </head>
            <body>
              <Title>Hello6! {String(Platform.web)}</Title>
            </body>
          </html>
        );
      } else {
        const { View, Text } = _npm_react_native;
        return (
          <View>
            <Text>Hello, RN!!!2@!@?</Text>
          </View>
        );
      }
    }
  }

  return TestApp;
};
