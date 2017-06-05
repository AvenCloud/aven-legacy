import DatabaseService from "./DatabaseService";

export default async function AuthRegisterAction(action) {
  const data = await DatabaseService.getDoc(action.username);
  console.log(data, action);
  return { wat: true };
}
