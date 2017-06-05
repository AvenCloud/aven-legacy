const fetch = require("node-fetch");
import Configuration from "./Configuration";

const AuthHeader =
  "Basic " +
  new Buffer(
    Configuration.secrets.plivo_id + ":" + Configuration.secrets.plivo_key
  ).toString("base64");

export async function sendSMS(destNumber, textBody) {
  const res = await fetch(
    "https://api.plivo.com/v1/Account/" +
      Configuration.secrets.plivo_id +
      "/Message/",
    {
      method: "post",
      headers: {
        Authorization: AuthHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        src: Configuration.secrets.from_phone,
        dst: destNumber,
        text: textBody
      })
    }
  );
  if (("" + res.status)[0] !== "2") {
    const json = await res.json();
    json.status = res.status;
    throw json;
  }
  const json = await res.json();
  return json;
}
