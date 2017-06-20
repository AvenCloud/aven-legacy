import React from "react";
import SimplePage from "./SimplePage";

class ProjectRow extends React.Component {
  render() {
    const { user, project } = this.props;
    return <a href={`/${user}/${project.name}`}><h3>{project.name}</h3></a>;
  }
}

export default class ProfilePage extends React.Component {
  static load = async (props, dispatch) => {
    const userName = props.params.user || (props.auth && props.auth.user);
    if (!userName) {
      return { user: null };
    }
    const user = await dispatch({
      type: "GetProfileAction",
      user: userName
    });
    return { user: { ...user, name: userName } };
  };
  static getTitle = ({ data }) => "User ";
  render() {
    const { data, auth } = this.props;
    const { publicProjects, privateProjects, name } = data.user;
    // <pre>{JSON.stringify(this.props.data.user)}</pre>
    return (
      <SimplePage>

        <h2>{name}</h2>

        <h2>Public Projects</h2>
        {publicProjects &&
          publicProjects.map((project, index) => (
            <ProjectRow key={index} project={project} user={name} />
          ))}
        <h2>Private Projects</h2>
        {privateProjects &&
          privateProjects.map((project, index) => (
            <ProjectRow key={index} project={project} user={name} />
          ))}
        <a href="/create" className="btn btn-lg btn-default btn-primary">
          Create Project
        </a>

        <h2>My Account</h2>

        <a href="/auth/logout" className="btn btn-lg btn-default">
          Log out
        </a>
        <a href="/account" className="btn btn-lg btn-default">
          Account Settings
        </a>
      </SimplePage>
    );
  }
}
