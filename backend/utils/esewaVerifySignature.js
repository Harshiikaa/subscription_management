// utils/esewaVerifySignature.js
const crypto = require("crypto");

function verifyEsewaSignature({ signed_field_names, signature, payload }) {
  if (!signed_field_names || !signature) return false;
  const fields = signed_field_names.split(",").map((f) => f.trim());
  const toSign = fields.map((f) => `${f}=${payload[f]}`).join(",");

  const expected = crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
    .update(toSign)
    .digest("base64");

  return expected === signature;
}

module.exports = verifyEsewaSignature;
