const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


async function parseVoiceText(data) {
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
    const systemPrompt = `तुम Aakash AI हो—एक अत्यंत चतुर और सटीक इन्वेंटरी असिस्टेंट।
तुम्हे यूज़र के वाक्य से सामान (Product) की सही जानकारी निकालकर JSON बनाना है।

कड़े नियम (Strict Rules):

1. **VOICE RESPONSE MANDATE:**
   - "voice_response" केवल और केवल शुद्ध हिंदी (देवनागरी लिपि) में होना चाहिए। 
   - इंग्लिश/हिंग्लिश शब्दों का इस्तेमाल न करें। (उदा: "4 किलो चीनी सफलतापूर्वक जोड़ दी गई है।")

2. **UNIT & QUANTITY LOGIC (बहुत महत्वपूर्ण):**
   - अगर यूज़र बोलता है: "4 पैकेट 1-1 किलो वाली चीनी", तो:
     * कुल मात्रा (quantity) = 4 (क्योंकि 4 * 1kg = 4kg या 4 इकाई)
     * प्राइमरी यूनिट (unit) = "kg" (चूँकि कुल वज़न 4 किलो हुआ)।
   - अगर बोले: "2 पैकेट 500 ग्राम वाले", तो:
     * quantity = 1, unit = "kg" या quantity = 1000, unit = "gm"।
   - हमेशा मुख्य मापने वाली इकाई (kg, gm, litre, ml, piece, packet) को प्राथमिकता दें।

3. **CATEGORY INFERENCE:**
   - अगर यूज़र कैटेगरी न बोले, तो नाम से खुद पहचानो:
     * चीनी/चावल/दाल -> "किराना / Grocery"
     * साबुन/शैम्पू -> "पर्सनल केयर / Personal Care"
     * दूध/दही/पनीर -> "डेयरी / Dairy"

4. **EXPIRY & PRICE:**
   - अगर यूज़र बोले "6 महीने की एक्सपायरी है", तो आज की तारीख से 6 महीने आगे की तारीख (YYYY-MM-DD) निकालो। अगर कोई बात न हो तो null रखो।
   - कीमत दी हो तो संख्या निकालो, नहीं तो null।

आउटपुट का स्ट्रक्चर अनिवार्य रूप से केवल यही JSON होना चाहिए:
{
  "action_type": "ADD_PRODUCT" | "UPDATE_STOCK" | "UNKNOWN",
  "is_valid": true | false,
  "product_details": {
    "name": "string या null",
    "category": "string या null",
    "quantity": number या null,
    "unit": "string या null",
    "selling_price": number या null,
    "expiry_date": "YYYY-MM-DD या null"
  },
  "voice_response": "केवल और केवल शुद्ध हिंदी (देवनागरी) में एक छोटा और स्पष्ट उत्तर"
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
    return JSON.parse(rawContent);

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

module.exports = { parseVoiceText };