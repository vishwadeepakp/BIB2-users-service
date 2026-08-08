const { Kafka } = require('kafkajs');

let producer = null;

const createKafkaClient = () => new Kafka({
  clientId: 'user-auth-service',
  brokers: [process.env.KAFKA_BROKER],
  ssl: { rejectUnauthorized: false },
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  // ⚠️ Vercel timeout से पहले फ़ैल होने के लिए retry timeouts छोटे रखो:
  connectionTimeout: 3000,
  requestTimeout: 4000,
  retry: {
    retries: 2 // Serverless में लंबे retries मत रखो
  }
});

const getProducer = async () => {
  if (!producer) {
    const kafka = createKafkaClient();
    producer = kafka.producer();
    await producer.connect();
    console.log('⚡ Kafka Producer Connected (New Instance)');
  }
  return producer;
};

const sendMessage = async (topic, message) => {
  try {
    const activeProducer = await getProducer();
    return await activeProducer.send({
      topic,
      messages: [message],
    });
  } catch (error) {
    console.warn('⚠️ Kafka Send failed, destroying stale producer & retrying once...', error.message);
    
    // 🔴 पुराने मरे हुए instance और सॉकेट को पूरी तरह साफ़ करो
    if (producer) {
      try { await producer.disconnect(); } catch (_) {}
      producer = null;
    }

    // 🟢 ताज़ा Producer बनाकर 1 बार में ही भेजो
    const freshProducer = await getProducer();
    return await freshProducer.send({
      topic,
      messages: [message],
    });
  }
};

const closeProducer = async () => {
  if (producer) {
    try {
      await producer.disconnect();
      console.log('Kafka Producer Disconnected');
    } catch (e) {}
    finally {
      producer = null;
    }
  }
};

module.exports = {
  sendMessage,
  closeProducer,
};