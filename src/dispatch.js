import data from "./data";

module.exports = async action => {
  // const f = await data.get("asdf");
  // console.log("gotten asdf", f);
  return { action, foo: "bar" };
};
