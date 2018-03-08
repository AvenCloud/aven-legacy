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
  Link,
  GetSessionAction,
  LoadingContainer,
  Platform,
  Touchable,
  AsyncStorage,
  Markdown,
  Unsplash,
  Title,
  View,
  StyleSheet,
  ProcessEnv,
  ScrollView,
  FullScreenView,
  _npm_tinycolor2,
}) => {
  class AvenLogo extends React.Component {
    render() {
      const applyColorWave = index =>
        _npm_tinycolor2({
          h: 190,
          s: 30,
          l: 0.2,
        });
      return (
        <View style={this.props.style}>
          <svg className="AHeaderLogo" viewBox="0 0 4520 1000" version="1.1">
            <g stroke="none" fill="none" fillRule="evenodd">
              <g fill={applyColorWave(0).toHexString()}>
                {/* a opening triangle */}
                <polygon points="0.0703574471 0 0.0703574471 1000 500.070357 0" />
              </g>
              <g fill={applyColorWave(1).toHexString()}>
                {/* a triangle */}
                <polygon points="600 500 400 900 800 900" />
              </g>
              <g fill={applyColorWave(2).toHexString()}>
                {/* after a */}
                <polygon points="1000 0 700 0 1200 1000 1500 1000" />
              </g>
              <g fill={applyColorWave(3).toHexString()}>
                {/* v triangle */}
                <polygon points="1580 500 1780 100 1380 100" />
              </g>
              <g fill={applyColorWave(4).toHexString()}>
                {/* pre-e */}
                <polygon points="2180 0 1680 1000 1980 1000 2480 0" />
              </g>
              <g fill={applyColorWave(5).toHexString()}>
                {/* e thing */}
                <polygon points="3520 0 3220 0 3120 200 2730 200 2630 400 3020 400 2920.23901 599.998905 2530 600 2430 800 2820 800 2720 1000 3020 1000" />
              </g>
              <g fill={applyColorWave(6).toHexString()}>
                {/* n triangle2 */}
                <polygon points="3920 500 4120 100 3720 100" />
              </g>
              <g fill={applyColorWave(7).toHexString()}>
                {/* n triangle1 */}
                <polygon points="3620 500 3420 900 3820 900" />
              </g>
              <g fill={applyColorWave(8).toHexString()}>
                {/* n closing triangle */}
                <polygon
                  transform="translate(4270.000000, 500.000000) scale(-1, -1) translate(-4270.000000, -500.000000) "
                  points="4020 6.82121026e-13 4020 1000 4520 6.95998814e-13"
                />
              </g>
            </g>
          </svg>
        </View>
      );
    }
  }
  const FooterLinkColor = "#ddd";
  const FooterLink = ({ to, children }) => (
    <Link to={to}>
      <Text style={{ color: FooterLinkColor, textDecorationLine: "none" }}>
        {children}
      </Text>
    </Link>
  );
  const FooterWithSession = ({ session }) => {
    let sessionLinks = (
      <React.Fragment>
        <FooterLink to="register">Register</FooterLink>
        <FooterLink to="login">Login</FooterLink>
      </React.Fragment>
    );

    if (session) {
      let sessionLinks = (
        <React.Fragment>
          <FooterLink to="register">My Account</FooterLink>
          <FooterLink to="login">Logout</FooterLink>
        </React.Fragment>
      );
    }
    const photoCredits = [
      Unsplash.cloudMain,
      Unsplash.wingWarm,
      Unsplash.wingGrey,
    ];
    const photoCreditLinks = photoCredits.map((p, index) => (
      <React.Fragment key={index}>
        <Link
          to={`https://unsplash.com/photos/${p.unsplashID}`}
          style={{ color: FooterLinkColor, textDecorationLine: "underline" }}
        >
          {p.author}
        </Link>
        {index !== photoCredits.length - 1 && ", "}
      </React.Fragment>
    ));
    return (
      <View style={{ backgroundColor: "#333", alignItems: "center" }}>
        <View
          style={{
            width: 800,
            margin: 40,
          }}
        >
          {sessionLinks}
          <FooterLink to="https://github.com/AvenCloud">GitHub</FooterLink>
          <FooterLink to="https://twitter.com/Aven_Cloud">Twitter</FooterLink>
          <FooterLink to="https://www.facebook.com/AvenCloudApps">
            Facebook
          </FooterLink>
          <Text style={{ color: FooterLinkColor }}>
            Photo credits: {photoCreditLinks}
          </Text>
          <Text style={{ color: "#ddd", textAlign: "center", marginTop: 50 }}>
            Copyright &copy; 2018 Aven LLC
          </Text>
        </View>
      </View>
    );
  };
  const SessionContainer = SessionComponent => {
    class SessionContainerComponent extends React.Component {
      state = { session: null };
      render() {
        return (
          <SessionComponent {...this.props} session={this.state.session} />
        );
      }
      async componentDidMount() {
        const session = await GetSessionAction();
        this.setState({ session });
      }
    }
    return SessionContainerComponent;
  };
  const Footer = SessionContainer(FooterWithSession);
  class TestApp extends React.Component {
    static title = "Aven";
    render() {
      return (
        <AppContainer title="Aven">
          <ScrollView style={{ flex: 1 }}>
            <FullScreenView style={{ backgroundColor: "white" }}>
              <Image
                source={{
                  uri: Unsplash.cloudMain.uri,
                }}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Text
                  style={{
                    color: "#0D2C4D",
                    fontSize: 24,
                    letterSpacing: 8,
                    textAlign: "center",
                    marginVertical: 80,
                  }}
                >
                  {"Make  Apps  Like  Magic".toUpperCase()}
                </Text>
                <AvenLogo
                  style={{
                    width: 470,
                    marginVertical: 40,
                    marginBottom: "30%",
                  }}
                />
              </View>
            </FullScreenView>
            <FullScreenView style={{ backgroundColor: "white" }}>
              <Image
                source={{
                  uri: Unsplash.wingWarm.uri,
                }}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ alignItems: "center", paddingVertical: 80 }}>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 84,
                    color: "black",
                    fontWeight: "200",
                    marginVertical: 20,
                  }}
                >
                  Aven Framework Beta
                </Text>
                <Text
                  style={{
                    color: "black",
                    textAlign: "center",
                    fontSize: 22,
                    maxWidth: 600,
                    margin: 20,
                    marginVertical: 20,
                    marginBottom: 140,
                  }}
                >
                  Try our alpha ReactJS framework for building iPhone Apps,
                  Android Apps, and websites
                </Text>
                <Button
                  onPress={() => {
                    Link.goTo("https://github.com/AvenCloud/aven");
                  }}
                  label="Get Started on GitHub"
                />
              </View>
            </FullScreenView>
            <FullScreenView style={{ backgroundColor: "white" }}>
              <Image
                source={{
                  uri: Unsplash.wingGrey.uri,
                }}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ alignItems: "center", paddingVertical: 120 }}>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 84,
                    color: "#444",
                    fontWeight: "200",
                    marginVertical: 30,
                  }}
                >
                  Aven in Production
                </Text>
                <Text
                  style={{
                    color: "#444",
                    textAlign: "center",
                    fontSize: 22,
                    maxWidth: 600,
                    margin: 20,
                    marginVertical: 30,
                  }}
                >
                  Almost ready for takeoff? Hire us to fix outstanding issues
                  and optimize your app. When ready, our team will help you
                  launch to app stores and the cloud!
                </Text>
                <Button
                  onPress={() => {
                    Link.goTo("mailto:support@aven.io");
                  }}
                  label="Contact Us"
                />
              </View>
            </FullScreenView>
            {false && (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 40,
                    maxWidth: 800,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 84,
                      color: "#444",
                      fontWeight: "200",
                      marginVertical: 30,
                    }}
                  >
                    Lets stay in touch
                  </Text>
                  <Text>
                    Get occasional updates on Aven, as we make it even easier
                    for you to build delightful apps!
                  </Text>
                  <Form
                    fields={[{ name: "email", label: "Email" }]}
                    onSubmit={data => {
                      // Alert(.EMAIL_SENDGRID_KEY);
                    }}
                  />
                </View>
              </View>
            )}
            <Footer />
          </ScrollView>
        </AppContainer>
      );
    }
  }

  return TestApp;
};
