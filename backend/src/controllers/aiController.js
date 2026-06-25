import { generateAIResponse } from '../services/geminiService.js';

export const chatWithAI = async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const aiResponse = await generateAIResponse(prompt, history || []);
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error communicating with AI Assistant' });
  }
};
