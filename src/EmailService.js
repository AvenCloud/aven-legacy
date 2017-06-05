const fetch = require("node-fetch");
import Configuration from "./Configuration";

export async function sendEmail(destEmail, subject, textBody) {
  const sendData = {
    personalizations: [{ to: [{ email: destEmail }] }],
    from: { email: Configuration.secrets.from_email },
    subject: subject,
    content: [{ type: "text/plain", value: textBody }]
  };
  const body = JSON.stringify(sendData);
  console.log(body, "WOAAAH");
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "post",
    headers: {
      Authorization: "Bearer " + Configuration.secrets.sendgrid_key,
      "Content-Type": "application/json"
    },
    body
  });
  if (("" + res.status)[0] !== "2") {
    const json = await res.text();
    throw {
      error: "EmailError",
      status: res.status,
      details: json
    };
  }
  return {};
}
