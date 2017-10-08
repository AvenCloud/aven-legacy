import React from "react";

import FolderComponent from "./FolderComponent";
import JSModuleComponent from "./JSModuleComponent";

const ComponentTypes = {
	Folder: FolderComponent,
	JSModule: JSModuleComponent
};

export default class GenericComponent extends React.Component {
	static load = async props => {
		const doc = await props.dispatch({
			type: "GetDocAction",
			user: props.user,
			project: props.project,
			id: props.id
		});
		let componentData = null;
		if (doc && doc.type && ComponentTypes[doc.type]) {
			const Component = ComponentTypes[doc.type];
			componentData =
				Component.load &&
				(await Component.load({
					...props,
					doc
				}));
		}
		return {
			doc,
			componentData
		};
	};
	render() {
		const { user, project, id, data } = this.props;
		if (!data || !data.doc) {
			return <div>Project Empty!</div>;
		}
		const { doc, componentData } = data;
		if (doc && doc.type && ComponentTypes[doc.type]) {
			const Component = ComponentTypes[doc.type];
			return (
				<Component
					data={componentData}
					doc={doc}
					user={user}
					project={project}
					id={id}
				/>
			);
		}
		return <div>{JSON.stringify(doc)}</div>;
	}
}
