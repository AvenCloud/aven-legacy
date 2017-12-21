import React from "react";

export default class FolderComponent extends React.Component {
  static load = async props => {
    return { loaded: "data", path: props.project };
  };
  render() {
    const { doc, data, user, project, id } = this.props;
    if (!doc) {
      return <div>Uh.. no doc provided!</div>;
    }
    return (
      <div>
        {Object.keys(doc.files).map(fileName => {
          const id = doc.files[fileName].value;
          return (
            <a key={fileName} href={`/${user}/${project}/~${id}`}>
              {fileName}
            </a>
          );
        })}

        <h1> {JSON.stringify(data)}</h1>
      </div>
    );
  }
}
