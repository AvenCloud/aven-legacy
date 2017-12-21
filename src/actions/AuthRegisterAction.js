const { genAuthCode } = require("../Utilities");

async function AuthRegisterAction(action, app, dispatch) {
	// this is where all the validation logic will go

	const userID = action.id;

	try {
		await app.model.user.create({
			displayName: action.displayName,
			password: action.password,
			id: userID
		});
	} catch (e) {
		if (e.name === "SequelizeUniqueConstraintError") {
			throw {
				statusCode: 400,
				code: "EXISTING_USERNAME",
				field: "id",
				message: "Duplicate username"
			};
		} else {
			console.error("Database Error: ", e);
			throw {
				statusCode: 500,
				code: "DB_ERROR",
				message: "Database Error"
			};
		}
	}

	const authCode = await genAuthCode();
	try {
		await app.model.authMethod.create({
			id: action.email,
			type: "EMAIL",
			owner: userID,
			primaryOwner: userID,
			verificationKey: authCode,
			verificationExpiration: new Date()
		});
	} catch (e) {
		if (e.name === "SequelizeUniqueConstraintError") {
			await app.model.user.destroy({
				where: {
					id: userID
				}
			});
			throw {
				statusCode: 400,
				code: "EXISTING_EMAIL",
				field: "email",
				message: "Duplicate email address"
			};
		} else {
			console.error("Database Error: ", e);
			throw {
				statusCode: 500,
				code: "DB_ERROR",
				message: "Database Error"
			};
		}
	}

	await app.infra.email.send(
		action.email,
		"Welcome",
		`
		Welcome to Aven!
		http://foo/?code=${authCode}
	`
	);


	return {
		userID,
		authID: action.email
	};
}

module.exports = AuthRegisterAction;
