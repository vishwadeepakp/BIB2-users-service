const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
const llmModel = async (text, content) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: content },
                { role: "user", content: text.trim() }
            ],
            model: "groq/compound-mini",
            temperature: 0.1, // Low temperature ensures rules are strictly followed
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0]?.message?.content;
        const resData = JSON.parse(rawContent)
        console.log("resData", resData)
        return resData;
    } catch (error) {
        console.error("Error in LLM Model:", error);
        return null;
    }
}

module.exports = { llmModel };