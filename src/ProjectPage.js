import React from "react";
import SimplePage from "./SimplePage";

export default class ProjectPage extends React.Component {
  static browserModule = "ProjectIndex";
  static load = async (props, dispatch) => {
    const pathParts = props.path.split("/");
    console.log(pathParts);
    const projectData = await dispatch({
      type: "GetProjectAction",
      user: pathParts[1],
      project: pathParts[2]
    });
    return { projectData };
  };
  static getTitle = ({ data }) => data.projectData && data.projectData.name;
  render() {
    return (
      <SimplePage>
        <h1>Ummmm {JSON.stringify(this.props.data.projectData)}</h1>
      </SimplePage>
    );
  }
}
