({ Agent, React }) => {
  class LoadingContainer extends React.Component {
    state = { docValue: null };
    async componentDidMount() {
      const record = await Agent.dispatch({
        type: "GetRecordAction",
        recordID: this.props.record,
      });
      if (record) {
        const doc = await Agent.dispatch({
          type: "GetDocAction",
          docID: record.docID,
          recordID: this.props.record,
        });
        this.setState({ docValue: doc.value });
      }
      Agent.subscribe(this.props.record, this._goChange);
    }
    _goChange = async () => {
      const record = await Agent.dispatch({
        type: "GetRecordAction",
        recordID: this.props.record,
      });
      const doc = await Agent.dispatch({
        type: "GetDocAction",
        docID: record.docID,
        recordID: this.props.record,
      });
      this.setState({ docValue: doc.value });
    };
    componentWillUnmount() {
      Agent.unsubscribe(this.props.record, this._goChange);
    }
    render() {
      return this.props.render(this.state.docValue, this._setRecord);
    }
    _setRecord = async value => {
      await Agent.dispatch({
        type: "SetRecordAction",
        permission: "public",
        recordID: this.props.record,
        docID: null,
      });

      const doc = await Agent.dispatch({
        type: "CreateDocAction",
        value,
        recordID: this.props.record,
      });

      await Agent.dispatch({
        type: "SetRecordAction",
        recordID: this.props.record,
        docID: doc.docID,
        permission: "public",
      });
    };
  }
  return LoadingContainer;
};
