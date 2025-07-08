const fetch = require("node-fetch");
const multiparty = require("multiparty");

exports.handler = async function (event) {
  const form = new multiparty.Form();

  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) return reject({ statusCode: 500, body: JSON.stringify({ error: err.message }) });

      const imageFile = files.image[0];
      const base64Image = require("fs").readFileSync(imageFile.path, { encoding: "base64" });

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const geminiResponse = await fetch(
          \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=\${apiKey}\`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: imageFile.headers["content-type"],
                        data: base64Image,
                      },
                    },
                    { text: "Describe this image in detail." },
                  ],
                },
              ],
            }),
          }
        );

        const result = await geminiResponse.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        resolve({
          statusCode: 200,
          body: JSON.stringify({ text }),
        });
      } catch (error) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        });
      }
    });
  });
};