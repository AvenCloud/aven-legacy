import React from "react";
import SimplePage from "./SimplePage";

export default class HomePage extends React.Component {
  static getTitle = () => null;
  render() {
    const { auth } = this.props;
    if (auth) {
      return (
        <SimplePage>
          <h2>Hello, {auth.user}</h2>
          <a href="/auth/logout" className="btn btn-lg btn-default">
            Log out
          </a>
          <a href="/create" className="btn btn-lg btn-default btn-primary">
            Create Project
          </a>
        </SimplePage>
      );
    }
    return (
      <SimplePage>
        <h2>Private Preview</h2>
        <p>
          If you were invited here, please register with an email
          address or username that includes your last name.
        </p>
        <div style={{ textAlign: "center", margin: "20px 0 10px" }}>
          <a
            href="/auth/login"
            className="btn btn-lg btn-default"
            style={{ marginRight: 15 }}
          >
            Sign in
          </a>
          <a href="/auth/register" className="btn btn-lg btn-primary">
            Register
          </a>
        </div>
      </SimplePage>
    );
  }
}
