const axios = require("axios");


async function verifyKhaltiPayment(pidx) {
  try {
    const khaltiUrl =
      process.env.KHALTI_VERIFY_URL ||
      "https://a.khalti.com/api/v2/epayment/lookup/";

    const response = await axios.post(
      khaltiUrl,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    console.log("Khalti total amt in utils: ", response.data.total_amount);

    // ✅ Only return the fields you actually need
    return {
      success: true,
      status: response.data.status,
      total_amount: Number(response.data.total_amount), // always paisa
      transaction_id: response.data.transaction_id,
      raw: response.data, // keep raw in case you want to debug
    };
  } catch (error) {
    console.error(
      "Khalti payment verification error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

/**
 * Verify Khalti payment status
 * @param {string} pidx - Payment ID from Khalti
 * @returns {Promise<Object>} Payment status response
 */
async function checkKhaltiPaymentStatus(pidx) {
  try {
    const khaltiUrl =
      process.env.KHALTI_STATUS_URL ||
      "https://a.khalti.com/api/v2/epayment/status/";

    const response = await axios.post(
      khaltiUrl,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      data: response.data,
      status: response.data.status,
      amount: response.data.amount,
      transaction_id: response.data.transaction_id,
    };
  } catch (error) {
    console.error(
      "Khalti payment status check error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

module.exports = {
  verifyKhaltiPayment,
  checkKhaltiPaymentStatus,
};
