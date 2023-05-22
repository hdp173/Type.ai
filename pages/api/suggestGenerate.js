import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const topic = req.body.topic || "";
  if (topic.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid topic",
      },
    });
    return;
  }

  const suggestion = req.body.suggestion || "";
  if (suggestion.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid suggestion",
      },
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: generatePrompt(topic, suggestion),
        },
      ],
    });
    console.log(completion.data);
    res.status(200).json({
      result: `<h1>${suggestion}</h1><p>${completion.data.choices[0].message.content}</p>`,
    });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(topic, suggestion) {
  return `
  This is the topic we're writing about.
  ${topic}
  And this is the suggested section title.
  ${suggestion}
 
  Generate a new content with the topic and suggested title.
  `;
  /*  return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`; */
}
