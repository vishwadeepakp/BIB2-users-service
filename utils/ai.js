const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
const llmModel = async (text, content) => {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: content },
            { role: "user", content: text.trim() }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Low temperature ensures rules are strictly followed
        response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0]?.message?.content;
    const resData = JSON.parse(rawContent)
    console.log("resData", resData)
    return resData;
}

module.exports = { llmModel };