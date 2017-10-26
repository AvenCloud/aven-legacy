const fetch = require("node-fetch");
const fileType = require("file-type");
const cookie = require("cookie");

const dispatch = async (action, auth) => {
  const cookies = auth.username &&
  auth.session && {
    user: auth.username,
    session: auth.session
  };
  const cookieHeader =
    cookies &&
    Object.keys(cookies)
      .map(c => cookie.serialize(c, cookies[c]))
      .join("; ");

  const result = await fetch(auth.server + "/api/dispatch", {
    method: "POST",
    body: JSON.stringify(action),
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    }
  });
  if (result.status !== 200) {
    throw await result.text();
  }
  let resultData = await result.buffer();
  const binaryType = fileType(resultData);
  try {
    if (!binaryType) {
      resultData = resultData.toString('utf8');
    }
  } catch (e) {}
  try {
    const resultJSON = JSON.parse(resultData);
    return resultJSON;
  } catch (e) {
    return resultData;
  }
};

module.exports = {
  dispatch
};
