import React from "react";

export default class HomePage extends React.Component {
  static getTitle = () => null;
  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <a href="/auth/login">Login</a>
        <a href="/auth/register">Register</a>
      </div>
    );
  }
}
