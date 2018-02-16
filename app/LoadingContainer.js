({ Agent, React, Title, Alert }) => {
  class LoadingContainer extends React.Component {
    state = { docValue: null };
    async componentDidMount() {
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
      Agent.subscribe(this.props.record, this._changeShit);
    }
    _changeShit = async () => {
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
      Agent.unsubscribe(this.props.record, this._changeShit);
    }
    render() {
      return this.props.render(this.state.docValue, this._setRecord);
    }
    _setRecord = async value => {
      await Agent.dispatch({
        type: "SetRecordAction",
        permission: "public",
        authUser: "eric",
        authSession:
          "f32010b7aacbf661f9d2ed3603ea99219aacbc7b3867c1525b72036ea6b59e9504b0f910b6fc955d687c0f4053a9c4cd-41e3dabe712c5b0ecb22c545e5dd69f6a49537ddaa4c5d8a822a58f9fdac62b4bc7394040681cf3f8d2045ac2970c653",
        recordID: this.props.record,
        docID: null,
      });

      const doc = await Agent.dispatch({
        type: "CreateDocAction",
        value,
        recordID: this.props.record,
        authUser: "eric",
        authSession:
          "f32010b7aacbf661f9d2ed3603ea99219aacbc7b3867c1525b72036ea6b59e9504b0f910b6fc955d687c0f4053a9c4cd-41e3dabe712c5b0ecb22c545e5dd69f6a49537ddaa4c5d8a822a58f9fdac62b4bc7394040681cf3f8d2045ac2970c653",
      });

      await Agent.dispatch({
        type: "SetRecordAction",
        recordID: this.props.record,
        docID: doc.docID,
        authUser: "eric",
        permission: "public",
        authSession:
          "f32010b7aacbf661f9d2ed3603ea99219aacbc7b3867c1525b72036ea6b59e9504b0f910b6fc955d687c0f4053a9c4cd-41e3dabe712c5b0ecb22c545e5dd69f6a49537ddaa4c5d8a822a58f9fdac62b4bc7394040681cf3f8d2045ac2970c653",
      });
    };
  }
  return LoadingContainer;
};
