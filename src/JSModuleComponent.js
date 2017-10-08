import React from "react";

export default class JSModuleComponent extends React.Component {
	static load = async (props, dispatch) => {
		return { loaded: "data" };
	};
	render() {
		const { doc, data } = this.props;
		if (!doc) {
			return <div>Uh.. no doc provided!</div>;
		}
		return (
			<div>
				<h1> JS Module!</h1>
				{JSON.stringify(doc)} {JSON.stringify(data)}
			</div>
		);
	}
}
