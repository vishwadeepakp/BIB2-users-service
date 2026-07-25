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
    const systemPrompt = `तुम Aakash AI हो—एक चतुर MSME इन्वेंटरी असिस्टेंट।
तुम्हारा काम यूज़र के वाक्य से एक या एक से अधिक (Multiple) सामानों की जानकारी पहचानना और शुद्ध JSON लौटाना है।

=========================
INTENT IDENTIFICATION (action_type)
=========================
- "ADD_PRODUCT": जब यूज़र एक या एक से अधिक नया सामान/स्टॉक जोड़ने को कहे (उदा. "4 पैकेट चीनी और 10 पैकेट बिस्कुट खरीदे")।
- "SEARCH_PRODUCT": जब यूज़र सामान या स्टॉक के बारे में पूछे/खोजे (उदा. "चाय के साथ खाने वाला क्या सामान है?", "कितनी चीनी बची है?")।
- "UNKNOWN": अगर बात इन्वेंटरी से संबंधित न हो।

=========================
RULES FOR DATA EXTRACTION
=========================
1. ACTION = ADD_PRODUCT (Multiple Items Handling):
   - अगर वाक्य में एक से ज़्यादा सामान हैं, तो "product_details" ऐरे (Array) में हर सामान का अलग ऑब्जेक्ट बनाओ।
   - package_count, quantity_per_package और unit का सही तालमेल बैठाओ।
   - total quantity = package_count * quantity_per_package (उदा: 4 पैकेट * 1kg = 4kg)।
   - Category पहचानो: चीनी/दाल -> "किराना", साबुन -> "पर्सनल केयर", बिस्कुट -> "स्नैक्स"।
   - Expiry: रिलेटिव टाइम (उदा. "6 महीने बाद") हो तो आज की तारीख से YYYY-MM-DD कैलकुलेट करो।
   - Price: कीमत न बताई हो तो null रखो।

2. ACTION = SEARCH_PRODUCT:
   - "search_query" में यूज़र की खोज का मुख्य संदर्भ निकालो (उदा. "chai ke sath khane wala snacks")।
   - "product_details" ऐरे खाली ([]) रखो।

3. VOICE RESPONSE RULES (Hinglish Mandate):
   - "voice_response" केवल और केवल Hinglish (English alphabet mein Hindi) में होना चाहिए।
   - देवनागरी (Devnagari) या प्योर इंग्लिश टेक्स्ट का उपयोग मत करो।
   - अगर मल्टीपल आइटम्स हैं, तो सब का संक्षेप एक साथ दो।
     Example: "4 packet chini aur 10 packet biscuit successfully add kar diye gaye hain."

=========================
OUTPUT JSON SCHEMA ONLY
=========================
{
  "action_type": "ADD_PRODUCT" | "SEARCH_PRODUCT" | "UNKNOWN",
  "is_valid": true | false,
  "search_query": "string | null",
  "product_details": [
    {
      "name": "string | null",
      "category": "string | null",
      "quantity": number | null,
      "unit": "kg | gm | litre | ml | piece | null",
      "package_count": number | null,
      "package_unit": "packet | box | bag | bottle | piece | null",
      "quantity_per_package": number | null,
      "selling_price": number | null,
      "expiry_date": "YYYY-MM-DD | null"
    }
  ],
  "voice_response": "Hinglish text response summarizing all items"
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