const Store = require("./Store");
const React = require("react");

class AccountLoader extends React.Component {
  state = { account: null };
  componentDidMount() {
    Store.getAndListen("Account", this._setAccount);
  }
  _setAccount = account => {
    this.setState({ account });
  };
  componentWillUnmount() {
    Store.unlisten("Account", this._setAccount);
  }
  render() {
    const { state } = this;
    return this.props.render(state.account);
  }
}

class ProjectLoader extends React.Component {
  state = { project: null };
  componentDidMount() {
    this._localId = `Project_${this.props.projectId}`;
    Store.getAndListen(this._localId, this._setProject);
  }
  _setProject = project => {
    this.setState({ project });
  };
  componentWillUnmount() {
    this._localId && Store.unlisten(this._localId, this._setProject);
  }
  render() {
    const { state } = this;
    return this.props.render(state.project);
  }
}

class DocLoader extends React.Component {
  state = this.props.id ? { doc: null } : { doc: this.props.defaultDoc };
  async componentDidMount() {
    if (this.props.id) {
      this._localId = `Document_${this.props.projectId}_${this.props.id}`;
      const doc = await Store.get(this._localId);
      this.setState({ doc });
      return;
    }
  }
  async componentWillReceiveProps(props) {
    if (props.id !== this.props.id) {
      this._localId = `Document_${props.projectId}_${props.id}`;
      const doc = await Store.get(this._localId);
      this.setState({ doc });
    }
  }
  componentWillUnmount() {
    this._localId && Store.unlisten(this._localId, this._setDoc);
  }
  render() {
    const { state } = this;
    return this.props.render(state.doc);
  }
}

class SessionLoader extends React.Component {
  state = null;
  componentDidMount() {
    Store.getAndListen("Session", this._setSession);
  }
  _setSession = session => {
    this.setState({ session });
  };
  render() {
    const state = this.state;
    const { navigation } = this.props;
    if (!state) {
      return null;
    }
    return this.props.render(state.session);
  }
}

const Loaders = {
  Doc: DocLoader,
  Account: AccountLoader,
  Project: ProjectLoader,
  Session: SessionLoader
};

module.exports = Loaders;
