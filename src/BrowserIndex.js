// alert("hello, world!");

const React = require("react");
const ReactDOM = require("react-dom");

import NavigationActions from "./NavigationActions";

const path = window.location.pathname;
const host = window.location.hostname;
const query = window.location.query;
debugger;

class Component extends React.Component {
  render() {
    return <div>Hello {this.props.name}</div>;
  }
}

ReactDOM.render(<Component name="John" />, document.getElementById("aven-app"));
