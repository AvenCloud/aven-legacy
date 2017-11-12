import React from "react";
const moment = require("./moment");
import SimplePage from "./SimplePage";
import GenericComponent from "./GenericComponent";
import { isTruthy } from "./QueryUtils";

export default class ProjectPage extends React.Component {
  static getBrowserModule = () => "ProjectIndex";
  static load = async props => {
    const pathParts = props.path.split("/");
    const user = props.params.user;
    const project = props.params.project;
    const query = props.query;
    const projectPath = pathParts.slice(3);
    console.log("loading for p", {
      user,
      query,
      project,
      projectPath
    });
    const projectData = await props.dispatch({
      type: "GetProjectAction",
      user,
      project
    });
    console.log("a");
    let queryId = null;
    if (projectPath.length === 1) {
      const match = /^_(.*)$/.exec(projectPath[0]);
      if (match) {
        queryId = match[1];
      }
    }
    let componentData = null;
    console.log("Loading generic component ", {
      user,
      project,
      queryId,
      dispatch: !!props.dispatch
    });
    if (queryId) {
      componentData = await GenericComponent.load({
        user,
        project,
        id: queryId,
        dispatch: props.dispatch
      });
    }
    console.log("c", projectData, componentData);
    const projectRootDoc = projectData && projectData.rootDoc;
    if (!componentData && projectRootDoc) {
      try {
        componentData = await GenericComponent.load({
          user,
          project,
          id: projectRootDoc,
          dispatch: props.dispatch
        });
      } catch (e) {
        console.log("failed to load generic component", e);
      }
    }
    console.log("d");
    const shouldRun = isTruthy(props.params.run);
    const result = {
      projectData,
      componentData,
      shouldRun,
      user,
      project,
      id: queryId || projectRootDoc
    };
    console.log({ result });
    return result;
  };
  static getTitle = ({ data }) => data.projectData && data.projectData.name;
  render() {
    const {
      user,
      dispatch,
      project,
      shouldRun,
      projectData,
      componentData,
      id
    } = this.props.data;

    return (
      <SimplePage>
        <h1>
          <a href={`/${user}`}>{user}</a>/<a href={`/${user}/${project}`}>
            {project}
          </a>
        </h1>
        <p>
          Created:{" "}
          {projectData &&
            moment(projectData.creationTime * 1000).format(
              "MMMM Do YYYY, h:mm:ss a"
            )}
        </p>
        <p>
          Last Updated:{" "}
          {projectData &&
            moment(projectData.updateTime * 1000).format(
              "MMMM Do YYYY, h:mm:ss a"
            )}
        </p>
        <GenericComponent
          dispatch={dispatch}
          id={id}
          data={componentData}
          user={user}
          project={project}
        />
      </SimplePage>
    );
  }
}
