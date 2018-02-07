({ Agent, React, Title }) => {
  class LoadingContainer extends React.Component {
    state = { record: null };
    async componentDidMount() {
      // const record = Agent.dispatch({
      //   type: 'GetRecordAction',
      //   recordID:
      // })
    }
    render() {
      return this.props.render(this.state.record);
    }
  }
  return LoadingContainer;
};
