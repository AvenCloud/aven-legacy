import React from "react";
import SimplePage from "./SimplePage";

export default class NotFoundPage extends React.Component {
  static getTitle = () => "Whoops!";
  render() {
    return <SimplePage><h1>This could not be found</h1></SimplePage>;
  }
}
