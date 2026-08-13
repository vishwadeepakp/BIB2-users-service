const InventoryLog = require('../models/InventoryLog');
const database = require("../config/database");
const { stockUpdate } = require("../utils/kafka");
const { INTENT_CLASSIFIER_PROMPT, ADD_INVENTORY_PROMPT, SEARCH_INVENTORY_PROMPT } = require("../promt");
const { llmModel } = require("../utils/ai");

// Connection instance लें
const sequelize = database.getConnection();


async function parseVoiceText(data, userID) {
  try {
    const text = data?.query || data?.text;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return {
        action_type: "UNKNOWN",
        is_valid: false,
        product_details: {
          name: null,
          category: null,
          quantity: null,
          unit: null,
          selling_price: null,
          expiry_date: null
        },
        voice_response: "क्षमा करें, मुझे आपकी आवाज़ या पाठ स्पष्ट नहीं मिला। कृपया पुनः प्रयास करें।"
      };
    }

    const intent = await llmModel(text, INTENT_CLASSIFIER_PROMPT(text));

    console.log("intent", intent)

    if (intent.intent == 'ADD_INVENTORY') {
      const addInventoyJSON = await llmModel(text, ADD_INVENTORY_PROMPT(text));
      return addInventoyJSON;
    } else if (intent.intent == 'SEARCH_INVENTORY_LOGS') {
      const searchInventoryJSON = await llmModel(text, SEARCH_INVENTORY_PROMPT(text, userID));
      console.log("searchInventoryJSON", searchInventoryJSON);
      const SearchData = await getSearchData(searchInventoryJSON.generated_query, userID);
      return { data: SearchData, voice_response: searchInventoryJSON.voice_response, action_type: "SEARCH_PRODUCT" }
    } else if (intent.intent == 'XXXXX') {
      const searchInventoryJSON = await llmModel(text, SEARCH_INVENTORY_PROMPT(text, userID));
      const SearchData = await getSearchData(searchInventoryJSON.generated_query, userID);
      return { data: SearchData, voice_response: searchInventoryJSON.voice_response, action_type: "SEARCH_PRODUCT" }
    }

    // if (resData.action_type == "SEARCH_PRODUCT") {
    //   const SearchData = await getSearchData(resData.generated_query, userID);
    //   console.log("SearchData", SearchData)
    //   return { data: SearchData, voice_response: resData.voice_response, action_type: "SEARCH_PRODUCT" }
    // } else {
    //   return resData;
    // }

  } catch (error) {
    console.error("❌ Groq AI Service Error:", error.message || error);
    return {
      action_type: "UNKNOWN",
      is_valid: false,
      product_details: {
        name: null,
        category: null,
        quantity: null,
        unit: null,
        selling_price: null,
        expiry_date: null
      },
      voice_response: "सर्वर में कुछ समस्या आई है, कृपया थोड़ी देर बाद प्रयास करें।"
    };
  }
}

async function saveInventory(product_details, userID) {
  try {
    if (product_details.length > 0) {

      // DB रिकॉर्ड्स का एरे तैयार करो
      const logsToInsert = product_details.map(item => ({
        userId: userID,
        name: item.name,
        category: item.category,
        type: 'IN', // Default Stock IN
        quantity: item.quantity,
        unit: item.unit,
        packageCount: item.package_count,
        packageUnit: item.package_unit,
        quantityPerPackage: item.quantity_per_package,
        sellingPrice: item.selling_price,
        buyingPrice: item.buying_price,
        supplierName: item.supplier_name,
        expiryDate: item.expiry_date,
        tags: item.tags || [],
        voiceResponse: "voice_response",
      }));

      // Bulk Insert (एक ही क्वेरी में सारे आइटम्स सेव)
      await InventoryLog.bulkCreate(logsToInsert);

      await stockUpdate({ userId: userID, products: product_details[0] }); // Kafka को स्टॉक अपडेट इवेंट भेजो

      return {
        success: true,
        message: "saved"
      };
    }
  } catch (error) {
    console.error("❌ Error saving inventory:", error.message);
    throw new Error(error.message || "Error saving inventory");
  }
}

async function getSearchData(query, userID) {
  const finalQuery = query.replace(/{{USER_ID}}/g, userID);
  const [dbData] = await sequelize.query(finalQuery);
  return dbData
}

module.exports = { parseVoiceText, saveInventory };