const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");

// Paste your deployed Cloudflare Worker URL here
const WORKER_URL = "https://YOUR-WORKER-URL.workers.dev";

const messages = [
  {
    role: "system",
    content: `You are the L’Oréal Smart Routine & Product Advisor.

You only answer questions related to:
- L’Oréal products
- skincare
- haircare
- makeup
- fragrances
- beauty routines
- beauty recommendations
- product categories and ingredients related to beauty

Rules:
1. Be friendly, clear, and helpful.
2. Only answer beauty-related and L’Oréal-related questions.
3. Politely refuse unrelated topics such as math, coding, politics, sports, or general trivia.
4. If the user asks for a routine, provide step-by-step help.
5. If the user asks for a recommendation, explain why the suggestion fits.
6. Do not claim to be a doctor or dermatologist.
7. If the user describes a serious skin issue, suggest speaking with a licensed professional.`,
  },
];

function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showLatestQuestion(text) {
  latestQuestion.textContent = `You: ${text}`;
  latestQuestion.classList.remove("hidden");
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "message-row assistant";
  row.id = "typingRow";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble typing";
  bubble.textContent = "Thinking...";

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
  const typingRow = document.getElementById("typingRow");
  if (typingRow) {
    typingRow.remove();
  }
}

addMessage(
  "assistant",
  "Hi! I’m your L’Oréal beauty assistant. Ask me about products, skincare, makeup, haircare, fragrances, or routines.",
);

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  showLatestQuestion(text);

  messages.push({
    role: "user",
    content: text,
  });

  userInput.value = "";
  showTyping();

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const data = await response.json();
    removeTyping();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t generate a response right now.";

    addMessage("assistant", reply);

    messages.push({
      role: "assistant",
      content: reply,
    });
  } catch (error) {
    removeTyping();
    addMessage(
      "assistant",
      "Sorry, something went wrong while connecting to the chatbot.",
    );
    console.error(error);
  }
});
