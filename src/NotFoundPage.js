import React from "react";

export default class NotFoundPage extends React.Component {
  static getTitle = () => "Whoops!";
  render() {
    return <h1>This could not be found</h1>;
  }
}
