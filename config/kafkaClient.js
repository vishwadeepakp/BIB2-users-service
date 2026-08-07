const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'user-auth-service',
  brokers: [process.env.KAFKA_BROKER],
  ssl: {
    rejectUnauthorized: false, // अगर self-signed certificate है तो true कर सकते हैं
  },
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});

const producer = kafka.producer();

// Producer को एक बार कनेक्ट करने का हेल्पर
const connectProducer = async () => {
  await producer.connect();
  console.log("🚀 Kafka Producer Connected!");
};

connectProducer();

module.exports = producer;