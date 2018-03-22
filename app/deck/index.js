({
  React,
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  FullScreenView,
  Platform,
  Icon,
}) => {
  const Title = ({ children, color }) => (
    <View style={{ padding: 15, paddingVertical: 30 }}>
      <Text
        style={{
          fontSize: 32,
          textAlign: "center",
          color: color || "#222",
        }}
      >
        {children}
      </Text>
    </View>
  );

  const Subtitle = ({ children }) => (
    <View style={{ padding: 15, paddingVertical: 20 }}>
      <Text
        style={{
          fontSize: 22,
          textAlign: "center",
          color: "#333",
        }}
      >
        {children}
      </Text>
    </View>
  );

  const Page = ({ children, style }) => (
    <View
      style={{
        padding: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#bbd",
        alignItems: "center",
      }}
    >
      <View style={{ maxWidth: 800 }}>{children}</View>
    </View>
  );

  const LogoList = ({ logos }) =>
    logos.map((logo, i) => (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 20,
        }}
        key={i}
      >
        <Image
          style={{ width: 200, height: 80 }}
          source={logo.image}
          resizeMode="contain"
        />
        <Text
          style={{
            textAlign: "center",
            paddingTop: 10,
            color: "#666",
            fontSize: 20,
          }}
        >
          {logo.caption}
        </Text>
      </View>
    ));

  const BulletPage = ({ items, title, color }) => (
    <Page>
      <Title color={color}>{title}</Title>
      <View style={{ alignItems: "flex-start" }}>
        {items.map((item, i) => (
          <View
            style={{
              alignItems: "center",
              margin: 20,
              marginVertical: 10,
              flexDirection: "row",
            }}
            key={i}
          >
            <View style={{ width: 60, paddingLeft: 20 }}>
              {item.icon && <Icon name={item.icon} size={30} color={color} />}
            </View>
            <Text
              style={{
                padding: 10,
                color: "#555",
                fontSize: 20,
                paddingRight: 20,
              }}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  );

  const PageScrollView = ({ pagingEnabled, children }) => {
    if (Platform.web) {
      return children;
    }
    return (
      <ScrollView
        style={{ flex: 1 }}
        pagingEnabled={pagingEnabled}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  };

  class App extends React.Component {
    static title = "Aven Deck";
    render() {
      return (
        <PageScrollView pagingEnabled={false}>
          <Page>
            <Image
              source={{ uri: "/assets/AvenLogo.png" }}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
          </Page>

          <Page>
            <Title color="#4444cc">What does Aven do?</Title>
            <Subtitle>
              We build mobile apps and websites with our on-demand development
              team
            </Subtitle>
          </Page>

          <BulletPage
            title="Why is Eric the best founder for Aven?"
            color="#cc5555"
            items={[
              {
                icon: "facebook-square",
                text:
                  "Built iOS and Android apps at Facebook for 3+ years, with 7+ years building on web",
              },
              {
                icon: "code-fork",
                text:
                  "Creator and maintainer of several popular open-source projects (React Native, React Navigation)",
              },
              {
                icon: "microphone",
                text:
                  "Experienced educator: Many conference and meetup talks, workshops at Facebook and Sony, guest lecture at Harvard",
              },
            ]}
          />
          <Page>
            <Title color="#44aa44">Tracking Market Growth</Title>
            <Image
              style={{ width: 800, height: 400 }}
              source="/assets/enterprise-software-market.png"
              resizeMode="contain"
            />
            <Subtitle>
              Market growth of IT Enterprise software 2009-2019. Projected $389B
              in 2018
            </Subtitle>
            <a
              href="https://www.statista.com/statistics/203428/total-enterprise-software-revenue-forecast/"
              style={{ textAlign: "center", color: "#44c" }}
            >
              Via Statista 2018
            </a>
          </Page>
          <Page>
            <Title color="#4444aa">Growth of Development Community</Title>
            <Image
              style={{ width: 800, height: 400 }}
              source="/assets/fb-community-growth.png"
              resizeMode="contain"
            />
            <Subtitle>Growth of React Native Community Group on FB</Subtitle>
            <a
              href="https://www.facebook.com/groups/react.native.community/insights"
              style={{ textAlign: "center", color: "#44c" }}
            >
              Via FB Group insights
            </a>
          </Page>
          <Page>
            <Title color="#cc9944">Who is Aven's competition?</Title>
            <LogoList
              logos={[
                // storetasker
                // coders clan
                // airfleet
                //
                {
                  image: { uri: "/assets/competitors/upwork-logo.png" },
                  caption: "Raised ~$170M from Benchmark etc.",
                },
                {
                  image: { uri: "/assets/competitors/gigster-logo.png" },
                  caption: "Raised $52M from a16z and Redpoint",
                },
                {
                  image: { uri: "/assets/competitors/freelancer-logo.png" },
                  caption: "Public, market cap $190M",
                },
              ]}
            />
          </Page>
          <BulletPage
            color="#999955"
            title="What problems are Aven solving?"
            items={[
              {
                icon: "fire",
                text:
                  "Projects are all built differently, which limits availability of contributors",
              },
              {
                icon: "question-circle",
                text:
                  "Contract expectations often unclear, and both parties leave dissatisfied",
              },
              {
                icon: "star-half-empty",
                text:
                  "Reputation systems are broken because technology varies too much",
              },
            ]}
          />

          <BulletPage
            title="What is Aven doing differently?"
            color="#44cc44"
            items={[
              {
                icon: "code",
                text:
                  "Focused technology to facilitate sharing of code and knowledge",
              },
              {
                icon: "filter",
                text:
                  "Micro-Contracts ensure clear expectations and fast product iteration",
              },
              {
                icon: "globe",
                text:
                  "Open Source framework and example apps to attract developers and customers",
              },
            ]}
          />

          <BulletPage
            title="Where is Aven now?"
            color="#5555cc"
            items={[
              {
                icon: "microphone",
                text: "Preparing to launch the development framework",
              },
              {
                icon: "book",
                text:
                  "Aven LLC is a California company, fully owned by Eric Vicenti",
              },
              {
                icon: "money",
                text: "Discussing contracts with initial clients",
              },
              {
                icon: "address-book",
                text:
                  "Seeking advisors and possible seed investment, smart money only",
              },
            ]}
          />
        </PageScrollView>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return App;
};
