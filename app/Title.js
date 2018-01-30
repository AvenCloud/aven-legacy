({ React }) => {
  class Title extends React.Component {
    render() {
      return <h1>{this.props.children}</h1>;
    }
  }
  return Title;
};
