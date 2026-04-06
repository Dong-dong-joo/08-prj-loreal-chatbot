const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");

const WORKER_URL = "https://calm-feather-1e24.dkim234.workers.dev";

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

Rules:
1. Be friendly and clear.
2. Only answer beauty-related questions.
3. Politely refuse unrelated questions.
4. Suggest routines step-by-step.
5. Explain recommendations simply.`,
  },
];

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;

  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showLatestQuestion(text) {
  latestQuestion.textContent = `You: ${text}`;
  latestQuestion.classList.remove("hidden");
}

addMessage(
  "ai",
  "Hi! I’m your L’Oréal assistant. Ask me about skincare, makeup, or routines.",
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

  addMessage("ai", "Thinking...");

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    console.log("Worker response:", data);

    chatWindow.lastChild.remove();

    let reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      if (typeof data.error === "object") {
        reply = JSON.stringify(data.error);
      } else if (typeof data.error === "string") {
        reply = data.error;
      } else {
        reply = "Sorry, I couldn't respond.";
      }
    }

    addMessage("ai", reply);

    messages.push({
      role: "assistant",
      content: reply,
    });
  } catch (err) {
    if (chatWindow.lastChild) {
      chatWindow.lastChild.remove();
    }
    addMessage("ai", "Error connecting to chatbot.");
    console.error(err);
  }
});
