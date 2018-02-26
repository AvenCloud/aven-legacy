const { Op } = require("sequelize");
const { digest } = require("../Utilities");
const stringify = require("json-stable-stringify");

async function CreateDocAction(action, infra, onRecord, dispatch) {
  const { recordID, authSession, authUser } = action;

  const permission = await dispatch({
    type: "GetPermissionAction",
    authSession,
    authUser,
    recordID,
  });

  if (!permission.canWrite) {
    throw {
      message: "Permission denied",
      statusCode: 403,
    };
  }

  const lastRecord =
    recordID &&
    (await infra.model.record.findOne({
      where: { id: { [Op.eq]: recordID } },
    }));
  if (!lastRecord) {
    throw {
      statusCode: 400,
      code: "INVALID_RECORD",
      message: "This record cannot be found or written to",
    };
  }
  const docContent = stringify(action.value);
  const docID = await digest(docContent);
  if (action.docID && action.docID !== docID) {
    throw {
      statusCode: 400,
      code: "INVALID_DOC_ID",
      field: "docID",
      message:
        "The docID, if provided, must match the sha1 (hex) checksum of the value",
    };
  }
  try {
    await infra.model.doc.create({
      id: docID,
      value: action.value,
      size: Buffer.byteLength(docContent, "utf8"),
      uploader: action.authUser,
    });
  } catch (e) {
    // This is OK, it means the exact same doc already exists in the DB. no need to store it twice!
    if (
      e.name !== "SequelizeUniqueConstraintError" ||
      e.errors[0].path !== "id"
    ) {
      throw e;
    }
  }
  // create the link
  await infra.model.docRecord.create({
    docId: docID,
    recordId: recordID,
  });
  return { docID, recordID };
}

module.exports = CreateDocAction;
