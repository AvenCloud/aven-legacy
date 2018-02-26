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
  //       <Page title="Aven">
  //         <Title>Register</Title>
  //         <Form
  //           fields={[
  //             { label: "Display Name", name: "displayName" },
  //             { label: "Username", name: "id" },
  //             { label: "Password", name: "password" },
  //             { label: "Email", name: "email" },
  //           ]}
  //           onSubmit={async data => {
  //             const res = await Agent.dispatch({
  //               type: "AuthRegisterAction",
  //               ...data,
  //             });
  //             Alert(JSON.stringify(res));
  //           }}
  //         />
  //       </Page>
  //     );
  //   }
  // }

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

  ## [Login](/login) [Register](/register)

  ![Aven Cloud](https://github.com/AvenCloud/aven/raw/master/graphics/AvenLogo.png)

  An opinionated attempt to make applications dramatically easier to develop and deploy. Use JS and React to target all platforms, update code and application data using the same real-time database.

  ## A Full Stack ReactJS Framework

  - Use SQLite backend in development, and PostgreSQL in production
  - Depends on NodeJS, React, React Native, Babel
  - Universal caching layer designed to make apps fast by default
  - Simple realtime database with smart cache and offline client functionality
  - Full Authentication and permission system
  - Simple module system
  - Use one JavaScript codebase for:
      - Backend logic
      - Server-rendered React sites
      - Client React apps and PWAs
      - React Native apps on iOS and Android

      `}
          />
        </Page>
      );
    }
  }

  // class TestApp extends React.Component {
  //   render() {
  //     return (
  //       <Page title="Aven">
  //         <Text>Hello World</Text>
  //         <Button onPress={() => {}} label="Foo" />
  //       </Page>
  //     );
  //   }
  // }

  return TestApp;
};
