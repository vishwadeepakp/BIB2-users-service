
const { sendMessage } = require('../config/kafkaClient');

const stockUpdate = async (payload) => {
  try {

    console.log("Received stock update payload:", payload);

    await sendMessage('stock-update', {
      key: payload.userId.toString(),
      value: JSON.stringify(payload),
    });

    return true;

  } catch (error) {
    console.error("❌ Failed to push event to Kafka:", error.message);
    throw error;
  }
};

module.exports = { stockUpdate };