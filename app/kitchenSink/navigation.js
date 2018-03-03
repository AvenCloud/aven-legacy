({ React, Link, Page, Alert, Text }) => {
  class NavigationDemo extends React.Component {
    static title = "Navigation";
    render() {
      return (
        <Page>
          <Text>Basic links</Text>
          <Link to="/register">Register</Link>
        </Page>
      );
    }
  }

  return NavigationDemo;
};
