async function SetPermissionAction(action, infra, onRecord, dispatch) {
  const { recordID, authUser, authSession } = action;

  const permission = await dispatch({
    type: "GetPermissionAction",
    authSession,
    authUser,
    recordID,
  });

  if (!permission.canAdmin) {
    throw {
      message: "Permission denied",
      statusCode: 403,
    };
  }

  throw {
    message: "Not yet impl!",
  };
}

module.exports = SetPermissionAction;
