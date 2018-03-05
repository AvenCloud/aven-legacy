const { Op } = require("sequelize");
const { compareHash } = require("../Utilities");
const pathJoin = require("path").join;

const ADMIN_PERMISSION = 8;
const READ_PERMISSION = 4;
const WRITE_PERMISSION = 2;
const EXECUTE_PERMISSION = 1;
const NO_PERMISSION = 0;

const canRead = val => val & ADMIN_PERMISSION || val & READ_PERMISSION;
const canExecute = val => val & ADMIN_PERMISSION || val & EXECUTE_PERMISSION;
const canWrite = val => val & ADMIN_PERMISSION || val & WRITE_PERMISSION;
const canAdmin = val => val & ADMIN_PERMISSION;

const addPermissions = (a, b) => a | b;
const subtractPermissions = (a, b) => a & ~b;

const PERMISSION = {
  ADMIN: addPermissions(
    ADMIN_PERMISSION,
    READ_PERMISSION,
    WRITE_PERMISSION,
    EXECUTE_PERMISSION,
  ),
  WRITE: addPermissions(WRITE_PERMISSION, READ_PERMISSION),
  READ: READ_PERMISSION,
  EXECUTE: addPermissions(EXECUTE_PERMISSION, READ_PERMISSION),
  WRITE_EXECUTE: addPermissions(
    WRITE_PERMISSION,
    EXECUTE_PERMISSION,
    READ_PERMISSION,
  ),
  DENY: NO_PERMISSION,
};

const getAbilities = permissionCode => ({
  canAdmin: !!canAdmin(permissionCode),
  canRead: !!canRead(permissionCode),
  canWrite: !!canWrite(permissionCode),
  canExecute: !!canExecute(permissionCode),
});

const isRootRecord = recordID => recordID === "/" || recordID === "";

async function GetPermissionAction(action, infra, onRecord, dispatch) {
  const { recordID, authSession, authUser } = action;

  let session = null;
  if (authUser && authSession) {
    session = await dispatch({
      type: "GetSessionAction",
      authSession,
      authUser,
    });
  }

  if (isRootRecord(recordID)) {
    const isRootUser = session && session.userID === infra.rootUser;
    const permission = isRootUser ? PERMISSION.ADMIN : PERMISSION.DENY;
    return {
      ...getAbilities(permission),
      recordID,
    };
  }

  let p = null;
  const recordIDs = recordID.split("/").map(seg => {
    p = p ? `${p}/${seg}` : seg;
    return p;
  });
  if (recordIDs.length > 1) {
    throw {
      message:
        "Does not support nested record IDs yet. Permissions will eventually inherit..",
    };
  }
  const record = await infra.model.record.findOne({
    where: { id: { [Op.eq]: recordIDs[0] } },
  });

  const parentRecordPath = pathJoin(recordID, "..");
  const parentRecord = parentRecordPath === "." ? "/" : parentRecordPath;
  if (!record) {
    if (session && `@${session.userID}` === recordID) {
      return { ...getAbilities(PERMISSION.ADMIN), recordID };
    }
    const parentPermission = await dispatch({
      ...action,
      type: "GetPermissionAction",
      recordID: parentRecord,
    });
    return {
      ...parentPermission,
      recordID,
    };
  }
  const doesOwnRecord = session && record.owner === session.userID;
  let ourPermissionCode = PERMISSION.DENY;
  if (record.permission === "PUBLIC") {
    ourPermissionCode = addPermissions(ourPermissionCode, PERMISSION.READ);
  }
  if (doesOwnRecord) {
    ourPermissionCode = addPermissions(ourPermissionCode, PERMISSION.ADMIN);
  } else if (session) {
    let permission = null;
    try {
      permission = await infra.model.recordPermission.findOne({
        where: {
          user: { [Op.eq]: session.userID },
          record: { [Op.eq]: recordID },
        },
      });
    } catch (e) {
      // this e makes no sense..
    }
    if (permission) {
      ourPermissionCode = addPermissions(
        ourPermissionCode,
        PERMISSION[permission.permission],
      );
    }
  }
  return {
    ...getAbilities(ourPermissionCode),
    recordID,
    userID: session && session.userID,
  };
}

module.exports = GetPermissionAction;
