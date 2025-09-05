// Improved dark mode toggle logic
window.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;

  function setDarkMode(enabled) {
    if (enabled) {
      body.classList.add('dark-mode');
      darkModeToggle.textContent = '☀️';
      localStorage.setItem('darkMode', 'true');
    } else {
      body.classList.remove('dark-mode');
      darkModeToggle.textContent = '🌙';
      localStorage.setItem('darkMode', 'false');
    }
  }

  // Load preference
  const darkPref = localStorage.getItem('darkMode') === 'true';
  setDarkMode(darkPref);

  darkModeToggle.addEventListener('click', () => {
    setDarkMode(!body.classList.contains('dark-mode'));
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // Helper to append a message bubble
  function appendMessage(role, text, id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role}`;
    if (id) msgDiv.id = id;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
  }

  // Helper to update a bubble's text
  function updateMessage(id, newText) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
      const bubble = msgDiv.querySelector('.message-bubble');
      if (bubble) bubble.textContent = newText;
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage('user', userMessage);
    input.value = '';

    // Add temporary bot message
    const thinkingId = `thinking-${Date.now()}`;
    appendMessage('bot', 'Gemini is thinking...', thinkingId);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        updateMessage(thinkingId, 'Failed to get response from server.');
        return;
      }

      const data = await response.json();
      if (data && typeof data.result === 'string' && data.result.trim()) {
        updateMessage(thinkingId, data.result.trim());
      } else {
        updateMessage(thinkingId, 'Sorry, no response received.');
      }
    } catch (err) {
      updateMessage(thinkingId, 'Failed to get response from server.');
    } finally {
      input.focus();
    }
  });
});
