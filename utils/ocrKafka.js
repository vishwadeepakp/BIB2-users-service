
const { sendMessage } = require('../config/kafkaClient');

const ocrKafka = async (payload) => {
    try {

        console.log("Received ocrKafka payload:", payload);

        await sendMessage('ocr', {
            key: payload.userID.toString(),
            value: JSON.stringify({ ...payload, type: 'inventory' }),
        });

        return true;

    } catch (error) {
        console.error("❌ Failed to push event to Kafka:", error.message);
        throw error;
    }
};

module.exports = { ocrKafka };