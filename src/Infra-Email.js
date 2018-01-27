const fetch = require("node-fetch")

const mode = process.env.EMAIL_MODE

async function Email() {
	const _testSentEmails = []
	return {
		type: "test",
		_testSentEmails,
		send: async (to, subject, content, meta) => {
			if (mode === "test") {
				_testSentEmails.push({ to, subject, content })
			} else if (mode === "development") {
				console.log("Pretending to send email:")
				console.log("to: ", to)
				console.log("subject: ", subject)
				console.log("content: ", content)
				_testSentEmails.push({ to, subject, content, meta })
			} else if (mode === "sendgrid") {
				const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
					method: "post",
					headers: {
						Authorization: "Bearer " + process.env.EMAIL_SENDGRID_KEY,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						personalizations: [{ to: [{ email: to }] }],
						from: { email: "Aven Support <support@aven.io>" },
						subject: subject,
						content: [{ type: "text/plain", value: content }],
					}),
				})
				if (("" + res.status)[0] !== "2") {
					const json = await res.text()
					throw {
						error: "EmailError",
						status: res.status,
						details: json,
					}
				}
			}
		},
	}
}

module.exports = Email
