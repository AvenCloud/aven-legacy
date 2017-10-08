import React from "react";
const moment = require("./moment");
import SimplePage from "./SimplePage";
import GenericComponent from "./GenericComponent";

export default class DocPage extends React.Component {
	static load = async (props, dispatch) => {
		const pathParts = props.path.split("/");
		const user = pathParts[1];
		const project = pathParts[2];
		const id = pathParts[3].split("_")[1];
		const componentData = await GenericComponent.load({
			user,
			project,
			id,
			dispatch
		});
		return { componentData, user, project, id };
	};
	static getTitle = ({ data }) => data.id;
	render() {
		const { componentData, user, id, project } = this.props.data;
		return (
			<GenericComponent
				id={id}
				data={componentData}
				user={user}
				project={project}
			/>
		);
	}
}
