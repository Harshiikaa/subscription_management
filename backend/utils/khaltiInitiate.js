const axios = require("axios");

/**
 * Initiate Khalti payment
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.return_url - Return URL after payment
 * @param {string} paymentData.website_url - Website URL
 * @param {number} paymentData.amount - Amount in paisa (multiply by 100)
 * @param {string} paymentData.purchase_order_id - Purchase order ID
 * @param {string} paymentData.purchase_order_name - Purchase order name
 * @param {Object} paymentData.customer_info - Customer information
 * @param {Object} paymentData.amount_breakdown - Amount breakdown
 * @returns {Promise<Object>} Khalti payment response
 */
async function initiateKhaltiPayment({
  return_url,
  website_url,
  amount,
  purchase_order_id,
  purchase_order_name,
  customer_info = {},
  amount_breakdown = {},
}) {
  try {
    const khaltiUrl =
      process.env.KHALTI_BASE_URL ||
      "https://a.khalti.com/api/v2/epayment/initiate/";

    const payload = {
      return_url,
      website_url,
      amount: Math.round(amount * 100), // Convert to paisa
      purchase_order_id,
      purchase_order_name,
      customer_info: {
        name: customer_info.name || "Customer",
        email: customer_info.email || "",
        phone: customer_info.phone || "",
        ...customer_info,
      },
      amount_breakdown: [
        {
          label: "Subtotal",
          amount: Math.round((amount_breakdown.subtotal || amount) * 100),
        },
        {
          label: "Tax",
          amount: Math.round((amount_breakdown.tax || 0) * 100),
        },
        {
          label: "Shipping",
          amount: Math.round((amount_breakdown.shipping || 0) * 100),
        },
        {
          label: "Discount",
          amount: Math.round((amount_breakdown.discount || 0) * 100),
        },
      ],
    };

    const response = await axios.post(khaltiUrl, payload, {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return {
      success: true,
      data: response.data,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    };
  } catch (error) {
    console.error(
      "Khalti payment initiation error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

module.exports = initiateKhaltiPayment;
