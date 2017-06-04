const fetch = require("node-fetch");
import config from "./config";

export async function sendEmail(destEmail, subject, textBody) {
  const endpointData = {
    personalizations: [{ to: [{ email: destEmail }] }],
    from: { email: config.fromEmail },
    subject: subject,
    content: [{ type: "text/plain", value: textBody }]
  };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "post",
    headers: {
      Authorization: "Bearer " + config.secrets.sendgrid_key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(endpointData)
  });
  if (res.status !== 200) {
    throw new Error("Woah, bad situation man");
  }
  const json = await res.json();
  return json;
}
