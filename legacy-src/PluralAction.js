import Utilities from "./Utilities";

export default async function PluralAction(action, dispatch) {
  const { viewerUser, viewerSession } = action;
  return {
    results: await Promise.all(
      action.actions.map(async innerAction => {
        let result = null;
        let error = null;
        try {
          result = await dispatch({
            ...innerAction,
            viewerSession,
            viewerUser
          });
        } catch (err) {
          error = err;
        }
        return { result, error };
      })
    )
  };
}
