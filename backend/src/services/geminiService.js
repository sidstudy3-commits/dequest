import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[Gemini API Warning] GEMINI_API_KEY is not configured or using default placeholder.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateAIResponse = async (prompt, chatHistory = []) => {
  const genAI = getGeminiClient();
  
  if (!genAI) {
    return "Hello! I am your DevQuest AI Assistant. To enable my fully functional capabilities, please update the `GEMINI_API_KEY` in the `backend/.env` file with a valid Google Gemini API Key. \n\nCurrently running in *Sandbox/Offline mode*. Try creating a topic or journal entry, and I'll track your developer progress!";
  }

  try {
    // We will use the fast and capable gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // System context to ensure Gemini responds as a senior developer mentor
    const systemInstruction = 
      "You are the DevQuest AI Mentor, an expert senior developer and guiding mentor. " +
      "You serve two main purposes:\n" +
      "1. Guide the user around the DevQuest platform. When they ask about creating projects, adding topics, writing journals, setting goals, saving resources, tracking milestones, or configuring settings on the site, give clear, step-by-step instructions based on the platform's UI:\n" +
      "   - Project Tracker: Go to the 'Projects' page in the sidebar, click the 'Add Project' button at the top-right, fill out the modal form (Title, Description, comma-separated Tech Stack, target Deadline, Progress percentage, and Status like PLANNING, IN_PROGRESS, or COMPLETED), and submit. Hover over cards to edit (pencil icon) or delete (trash icon). You can search projects using the search bar!\n" +
      "   - Learning Tracker: Go to the 'Learning' page, click 'Add Topic', select the difficulty (Beginner, Intermediate, Advanced), category, status, and notes. Click any topic card to edit its notes, progress slider, or status. You can search topics using the search bar.\n" +
      "   - Journal: Go to the 'Journal' page, click 'New Entry' to write daily developer logs/reflections. You can search logs using the search bar.\n" +
      "   - Goals: Go to the 'Goals' page to set Daily, Weekly, or Monthly checkboxes. Complete them by checking the checkboxes.\n" +
      "   - Resource Vault: Go to the 'Resource Vault' page, click 'Add Bookmark' to save docs, youtube links, or articles. Use the categories and search bar to filter.\n" +
      "   - Achievements: Go to 'Achievements' to view unlocked milestone badges (e.g., First Step, Dedicated Learner, Journalist, Builder, Goal Crusher). Unlocks trigger milestone notifications.\n" +
      "   - Settings: Edit your username, toggle theme mode using the ON/OFF slider switch, or clear all account data to reset your workspace.\n" +
      "2. Act as a senior developer/mentor in general. Answer coding questions, explain technical concepts, draft step-by-step study roadmaps, and review code snippets.\n" +
      "Always keep responses highly professional, encouraging, and formatted in clean markdown.";

    // Start a chat session
    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      }
    });

    const promptWithSystem = `${systemInstruction}\n\nUser Request: ${prompt}`;
    const result = await chat.sendMessage(promptWithSystem);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error('Failed to generate response from Gemini API: ' + error.message);
  }
};
