import OpenAI from 'openai';

// --- 1. TYPE DEFINITIONS (This fixes your error) ---
export type MessageRole = 'user' | 'agent' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolUsed?: string;
  timestamp: Date;
  tool_call_id?: string; // Needed for tool responses
}

// --- 2. CONFIGURATION ---
const openai = new OpenAI({
  // Use VITE_ prefix for client-side environment variables
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true
});

// --- 3. TOOL DEFINITIONS ---
const tools = [
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the internet for current information. Use this for specific facts, recent news, government policies updates (2024-2025), or when your internal knowledge is insufficient.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query optimized for a search engine (e.g. 'Singapore probate application fees 2025')",
          },
        },
        required: ["query"],
      },
    },
  },
];

// --- 4. TOOL IMPLEMENTATION (Tavily) ---
async function performWebSearch(query: string) {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
  
  if (!apiKey) {
    console.warn("No Tavily API Key found. Returning mock data.");
    return JSON.stringify({
      results: [{ title: "Mock Result", content: "Please add VITE_TAVILY_API_KEY to your .env file to get real search results." }]
    });
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
        max_results: 3
      }),
    });
    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error("Search API Error:", error);
    return JSON.stringify({ error: "Failed to fetch search results." });
  }
}

// --- 5. MAIN AGENT FUNCTION ---
export const queryAgent = async (userQuery: string): Promise<{ response: string; tool?: string }> => {
  const messages: any[] = [
    {
      role: "system",
      content: `You are a helpful assistant for Singapore post-death administration. 
      - Always prioritize using your internal knowledge for general concepts.
      - Use the 'web_search' tool IF AND ONLY IF the user asks for:
        1. Specific current fees, rates, or statistics (e.g., "how much is the probate filing fee?").
        2. Events or news after 2023.
        3. Specific addresses or contact details.
      - If you use the search tool, cite the sources provided in the tool output.`
    },
    { role: "user", content: userQuery }
  ];

  try {
    // Step 1: First call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: tools,
      tool_choice: "auto", 
    });

    const responseMessage = completion.choices[0].message;

    // Step 2: Did OpenAI ask for a tool?
    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      
      // Check if it is a function call
      if (toolCall.type === 'function' && toolCall.function.name === "web_search") {
        
        const args = JSON.parse(toolCall.function.arguments);
        
        // Execute Search
        const searchResults = await performWebSearch(args.query);

        // Add history
        messages.push(responseMessage);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: searchResults,
        });

        // Step 3: Second call to OpenAI
        const secondResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
        });

        return {
          response: secondResponse.choices[0].message.content || "No response generated.",
          tool: "Tavily_Web_Search"
        };
      }
    }

    // Fallback: Return memory response
    return {
      response: responseMessage.content || "I couldn't generate a response.",
      tool: "GPT-4o_Knowledge_Base"
    };

  } catch (error) {
    console.error("Agent Error:", error);
    return {
      response: "I'm encountering connection issues. Please check your API keys.",
      tool: "Error"
    };
  }
};