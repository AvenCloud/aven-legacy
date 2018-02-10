({ React, Text }) => {
  class Title extends React.Component {
    render() {
      return <Text>{this.props.children}</Text>;
    }
  }
  return Title;
};
