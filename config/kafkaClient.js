const { Kafka } = require('kafkajs');

let producer = null;
let connectingPromise = null;

const createKafkaClient = () => new Kafka({
  clientId: 'user-auth-service',
  brokers: [process.env.KAFKA_BROKER],
  ssl: {
    rejectUnauthorized: false,
  },
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});

const getProducer = async () => {
  if (!producer) {
    producer = createKafkaClient().producer();
  }

  if (!connectingPromise) {
    connectingPromise = (async () => {
      try {
        await producer.connect();
        console.log('🚀 Kafka Producer Connected!');
      } catch (error) {
        console.error('❌ Kafka producer connect failed:', error.message);
        producer = null;
        throw error;
      }
    })();
  }

  try {
    await connectingPromise;
  } catch (error) {
    connectingPromise = null;
    throw error;
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
    console.warn('⚠️ Kafka send failed; retrying with a fresh producer...', error.message);
    producer = null;
    connectingPromise = null;
    const activeProducer = await getProducer();
    return await activeProducer.send({
      topic,
      messages: [message],
    });
  }
};

const closeProducer = async () => {
  if (!producer) return;

  try {
    await producer.disconnect();
    console.log('🔌 Kafka Producer Disconnected');
  } catch (error) {
    console.error('❌ Kafka producer disconnect failed:', error.message);
  } finally {
    producer = null;
    connectingPromise = null;
  }
};

module.exports = {
  sendMessage,
  closeProducer,
};