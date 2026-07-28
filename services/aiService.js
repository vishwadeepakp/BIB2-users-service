const Groq = require("groq-sdk");
const InventoryLog = require('../models/InventoryLog');
const database = require("../config/database");

// Connection instance लें
const sequelize = database.getConnection();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


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

    // 🧠 Advanced Smart Prompt for Precise Unit Calculation & Pure Hindi Response
    const systemPrompt = `तुम Aakash AI हो—MSME इन्वेंटरी असिस्टेंट। यूज़र के वाक्य से जानकारी पहचानकर शुद्ध JSON लौटाओ।

=========================
TABLE SCHEMA: inventory_logs
=========================
Columns: user_id(UUID), name(VARCHAR), category(VARCHAR), quantity(DECIMAL), unit(VARCHAR), package_count(INT), package_unit(VARCHAR), quantity_per_package(DECIMAL), selling_price(DECIMAL), expiry_date(DATE YYYY-MM-DD), tags(JSON Array), voice_response(TEXT), created_at(TIMESTAMP), deleted_at(TIMESTAMP)

=========================
INTENT & RULES
=========================
1. ADD_PRODUCT:
   - "product_details" ऐरे भरो। generated_query = null रखो।
   - total quantity = package_count * quantity_per_package.
   - tags: 4-6 रेलेवेंट कीवर्ड्स जनरेट करो (e.g. ["biscuit", "snack", "chai ke sath"]).

2. SEARCH_PRODUCT:
   - "product_details" = [] खाली रखो।
   - "generated_query": केवल valid MySQL SELECT query बनाओ।
   - DB RULES FOR QUERY:
     * user_id के लिए हमेशा '{{USER_ID}}' का उपयोग करो।
     * deleted_at IS NULL की शर्त हमेशा लगाओ।
     * केवल SELECT क्वेरी की अनुमति है (NO DELETE, UPDATE, INSERT, DROP)।
     * Tags/Search: JSON_CONTAINS(tags, '"keyword"') या LOWER(name) LIKE '%keyword%' यूज़ करो।
     * Dates: "कल" -> DATE(created_at) = CURDATE() - INTERVAL 1 DAY, "आज" -> DATE(created_at) = CURDATE()

3. VOICE RESPONSE:
   - केवल Hinglish (English alphabet mein Hindi) में संक्षिप्त उत्तर दो।

=========================
OUTPUT JSON SCHEMA
=========================
{
  "action_type": "ADD_PRODUCT" | "SEARCH_PRODUCT" | "UNKNOWN",
  "is_valid": true | false,
  "search_query": "string | null",
  "generated_query": "MySQL SELECT query string | null",
  "product_details": [
    {
      "name": "string",
      "category": "string",
      "quantity": number,
      "unit": "kg|gm|litre|ml|piece",
      "package_count": number,
      "package_unit": "packet|box|bag|bottle|piece",
      "quantity_per_package": number,
      "selling_price": number,
      "expiry_date": "YYYY-MM-DD|null",
      "tags": ["string"]
    }
  ],
  "voice_response": "Hinglish text response"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text.trim() }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Low temperature ensures rules are strictly followed
      response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0]?.message?.content;
    const resData = JSON.parse(rawContent)
    console.log("resData", resData)
    if (resData.action_type == "SEARCH_PRODUCT") {
      const SearchData = await getSearchData(resData.generated_query, userID);
      console.log("SearchData", SearchData)
      return { data: SearchData, voice_response: resData.voice_response, action_type: "SEARCH_PRODUCT" }
    } else {
      return resData;
    }

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
      expiryDate: item.expiry_date,
      tags: item.tags || [],
      voiceResponse: "voice_response",
    }));

    // Bulk Insert (एक ही क्वेरी में सारे आइटम्स सेव)
    await InventoryLog.bulkCreate(logsToInsert);

    return {
      success: true,
      message: "saved"
    };
  }
}

async function getSearchData(query, userID) {
  const finalQuery = query.replace(/{{USER_ID}}/g, userID);
  const [dbData] = await sequelize.query(finalQuery);
  return dbData
}

module.exports = { parseVoiceText, saveInventory };