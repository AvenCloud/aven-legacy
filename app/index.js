({
  React,
  Form,
  Alert,
  Agent,
  Image,
  Page,
  Text,
  Button,
  AppContainer,
  LoadingContainer,
  Platform,
  Touchable,
  AsyncStorage,
  Markdown,
  Title,
}) => {
  // class TestApp extends React.Component {
  //   static title = "Aven";
  //   render() {
  //     return (
  //       <LoadingContainer
  //         record="color"
  //         render={(color, onColor) => (
  //           <Touchable
  //             feedback="highlight"
  //             style={{
  //               width: 100,
  //               height: 100,
  //               borderWidth: 5,
  //               backgroundColor: color ? "blue" : "red",
  //             }}
  //             onPress={() => {
  //               onColor(!color);
  //             }}
  //           />
  //         )}
  //       />
  //     );
  //   }
  // }

  class TestApp extends React.Component {
    static title = "Aven";
    render() {
      return (
        <Page title="Aven">
          <Markdown
            content={`
  # [Aven Framework (Soft Launch)](https://github.com/AvenDevelopment/aven)

      `}
          />
        </Page>
      );
    }
  }

  return TestApp;
};
