const fetch = require("node-fetch");
import Configuration from "./Configuration";

const AuthHeader =
  "Basic " +
  new Buffer(Configuration.PLIVO_ID + ":" + Configuration.PLIVO_KEY).toString(
    "base64"
  );

export async function sendSMS(destNumber, textBody) {
  const res = await fetch(
    "https://api.plivo.com/v1/Account/" + Configuration.PLIVO_ID + "/Message/",
    {
      method: "post",
      headers: {
        Authorization: AuthHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        src: Configuration.PLIVO_FROM_PHONE,
        dst: destNumber,
        text: textBody
      })
    }
  );
  const json = await res.json();
  if (("" + res.status)[0] !== "2") {
    json.status = res.status;
    throw json;
  }
  return json;
}
