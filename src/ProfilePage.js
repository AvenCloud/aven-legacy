import React from "react";
import SimplePage from "./SimplePage";

export default class NotFoundPage extends React.Component {
  static load = async (props, dispatch) => {
    const user = await dispatch({
      type: "GetProfileAction",
      user: props.params.user
    });
    return { user };
  };
  static getTitle = () => "User profile!";
  render() {
    return (
      <SimplePage>
        <h1>Ummmm {JSON.stringify(this.props.data.user)}</h1>
      </SimplePage>
    );
  }
}
