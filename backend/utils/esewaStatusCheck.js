// utils/esewaStatusCheck.js
const axios = require("axios");

async function esewaStatusCheck({
  product_code,
  total_amount,
  transaction_uuid,
}) {
  const url = `${
    process.env.ESEWA_STATUS_URL
  }?product_code=${encodeURIComponent(
    product_code
  )}&total_amount=${encodeURIComponent(
    total_amount
  )}&transaction_uuid=${encodeURIComponent(transaction_uuid)}`;
  const { data } = await axios.get(url, { timeout: 10000 });
  return data; // { product_code, transaction_uuid, total_amount, status, ref_id }
}

module.exports = esewaStatusCheck;
