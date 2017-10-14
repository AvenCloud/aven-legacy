import React from "react";
import SimplePage from "./SimplePage";
import ProfilePage from "./ProfilePage";

export default class HomePage extends React.Component {
  static load = ProfilePage.load;
  static getTitle = () => null;
  render() {
    const { auth } = this.props;
    if (auth) {
      return <ProfilePage {...this.props} />;
    }
    return (
      <SimplePage>
        <h2>Private Preview</h2>
        <p>
          If you were invited here, please register with an email address or
          username that includes your last name.
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
