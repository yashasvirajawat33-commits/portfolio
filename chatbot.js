
const chatInput = document.getElementById("userInput");
const chatButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");
const chatStatus = document.getElementById("chatStatus");

function showChatMessage(role, text) {
  const message = document.createElement("div");

  message.className =
    "chat-message " +
    (role === "user" ? "chat-user" : "chat-assistant");

  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  if (chatButton.disabled) return;

  const question = chatInput.value.trim();
  if (!question) return;

  showChatMessage("user", question);
  chatInput.value = "";

  chatButton.disabled = true;
  chatStatus.textContent = "AI is thinking...";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Chat backend error:", data.error);
      throw new Error(
        response.status === 429 ? "RATE_LIMIT" : "API_ERROR"
      );
    }

    const answer = data.reply;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("INVALID_RESPONSE");
    }

    showChatMessage("assistant", answer);

  } catch (error) {
    console.error("Chat error:", error.message);

    if (error.message === "RATE_LIMIT") {
      showChatMessage(
        "assistant",
        "Too many requests. Please wait and try again."
      );
    } else if (!navigator.onLine) {
      showChatMessage(
        "assistant",
        "No internet connection. Please reconnect."
      );
    } else {
      showChatMessage(
        "assistant",
        "AI service unavailable. Please try again."
      );
    }
  } finally {
    chatButton.disabled = false;
    chatStatus.textContent = "";
    chatInput.focus();
  }
}

chatButton.addEventListener("click", sendChatMessage);

chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
});