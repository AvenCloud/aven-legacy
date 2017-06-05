import DatabaseService from "./DatabaseService";

export default async function EmailRecieveAction(action) {
  await DatabaseService.createDoc("Email-" + Date.now(), action.data);
  return {};
}
