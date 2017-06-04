const fetch = require("node-fetch");
import config from "./config";

const AuthHeader =
  "Basic " +
  new Buffer(config.secrets.plivo_id + ":" + config.secrets.plivo_key).toString(
    "base64"
  );

export async function sendSMS(destNumber, textBody) {
  const res = await fetch(
    "https://api.plivo.com/v1/Account/" + config.secrets.plivo_id + "/Message/",
    {
      method: "post",
      headers: {
        Authorization: AuthHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        src: config.secrets.from_phone,
        dst: destNumber,
        text: textBody
      })
    }
  );
  if (res.status !== 200) {
    throw new Error("Woah, bad situation man");
  }
  const json = await res.json();
  return json;
}
