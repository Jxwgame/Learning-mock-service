const {
  RESULTS,
  TARGET_TYPES,
  ENTITY_TYPES,
  CHANGE_TYPES,
} = require("./constraints");

function requireRequestId(requestId) {
  if (typeof requestId === "string" && requestId.length > 0) {
    return requestId;
  }

  console.error("REQUEST_ID_REQUIRED – value =", requestId);
  console.error("STACK:", new Error().stack);

  const err = new Error("REQUEST_ID_REQUIRED");
  err.status = 500;
  throw err;
}


function assertEnum(set, value, code) {
  if (!set.has(value)) {
    const err = new Error(code);
    err.status = 500;
    throw err;
  }
}

module.exports = {
  requireRequestId,
  assertResult: (v) => assertEnum(RESULTS, v, "INVALID_AUDIT_RESULT"),
  assertTargetType: (v) => assertEnum(TARGET_TYPES, v, "INVALID_TARGET_TYPE"),
  assertEntityType: (v) => assertEnum(ENTITY_TYPES, v, "INVALID_ENTITY_TYPE"),
  assertChangeType: (v) => assertEnum(CHANGE_TYPES, v, "INVALID_CHANGE_TYPE"),
};
