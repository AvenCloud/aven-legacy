({ React, Markdown, Actions, Page }) => {
  class Display extends React.Component {
    static title = "Aven";
    render() {
      return (
        <Page title="Aven">
          <Markdown content={Actions.value} />
        </Page>
      );
    }
  }
  return Display;
};
