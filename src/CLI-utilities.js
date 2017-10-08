const fetch = require("node-fetch");
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
  const resultJSON = await result.json();
  return resultJSON;
};

module.exports = {
  dispatch
};
