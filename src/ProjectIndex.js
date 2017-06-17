// alert("hello, world!");

const React = require("react");
const ReactDOM = require("react-dom");

class HelloMessage extends React.Component {
  render() {
    return <div>Hello {this.props.name}</div>;
  }
}

// ReactDOM.render(<HelloMessage name="John" />, document.body);
