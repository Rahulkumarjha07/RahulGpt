
import { useEffect, useRef, useState } from "react";

function App() {
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [loadingConversations, setLoadingConversations] =
    useState(true);
  const [deletingChat, setDeletingChat] = useState(null);

  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // =========================================
  // LOAD CONVERSATIONS
  // =========================================

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);

      const response = await fetch(
        `${API_URL}/conversations`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load conversations"
        );
      }

      const chatList = data.conversations || [];

      setConversations(chatList);

      // Select an existing conversation automatically
      setConversationId((currentId) => {
        if (
          currentId &&
          chatList.some(
            (chat) => chat._id === currentId
          )
        ) {
          return currentId;
        }

        return chatList[0]?._id || null;
      });
    } catch (error) {
      console.error(
        "Load conversations error:",
        error.message
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // =========================================
  // LOAD MESSAGES
  // =========================================

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/messages/${conversationId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load messages"
          );
        }

        if (!cancelled) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Load messages error:",
            error.message
          );
          setMessages([]);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // =========================================
  // AUTO SCROLL
  // =========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =========================================
  // CREATE NEW CHAT
  // =========================================

  const createNewChat = async () => {
    if (creatingChat) return;

    try {
      setCreatingChat(true);

      const response = await fetch(
        `${API_URL}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create chat"
        );
      }

      const newConversation = data.conversation;

      setConversations((previous) => [
        newConversation,
        ...previous,
      ]);

      setConversationId(newConversation._id);
      setMessages([]);
      setMessage("");
    } catch (error) {
      console.error(
        "Create chat error:",
        error.message
      );

      alert(`Could not create chat: ${error.message}`);
    } finally {
      setCreatingChat(false);
    }
  };

  // =========================================
  // SELECT CONVERSATION
  // =========================================

  const selectConversation = (id) => {
    if (id === conversationId) return;

    setConversationId(id);
    setMessages([]);
    setMessage("");
  };

  // =========================================
  // DELETE CONVERSATION
  // =========================================

  const deleteConversation = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat? All its messages will also be deleted."
    );

    if (!confirmed) return;

    try {
      setDeletingChat(id);

      const response = await fetch(
        `${API_URL}/conversations/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete conversation"
        );
      }

      const remainingChats = conversations.filter(
        (chat) => chat._id !== id
      );

      setConversations(remainingChats);

      if (id === conversationId) {
        setMessages([]);
        setMessage("");
        setConversationId(
          remainingChats[0]?._id || null
        );
      }
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error.message
      );

      alert(`Could not delete chat: ${error.message}`);
    } finally {
      setDeletingChat(null);
    }
  };

  // =========================================
  // PIN / UNPIN CONVERSATION
  // =========================================

  const togglePinConversation = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/conversations/${id}/pin`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update pin"
        );
      }

      await loadConversations();
    } catch (error) {
      console.error(
        "Pin conversation error:",
        error.message
      );

      alert(`Could not update pin: ${error.message}`);
    }
  };

  // =========================================
  // SEND MESSAGE
  // =========================================

  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || loading || !conversationId) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/messages/${conversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send message"
        );
      }

      setMessages((previous) => [
        ...previous,
        data.assistantMessage,
      ]);

      await loadConversations();
    } catch (error) {
      console.error(
        "Send message error:",
        error.message
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SUGGESTIONS
  // =========================================

  const handleSuggestion = (text) => {
    setMessage(text);
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">R</div>
          <span>RahulGPT</span>
        </div>

        <button
          className="new-chat"
          onClick={createNewChat}
          disabled={creatingChat}
        >
          <span>＋</span>
          {creatingChat ? "Creating..." : "New chat"}
        </button>

        <div className="sidebar-section">
          <p className="section-title">Your chats</p>

          {loadingConversations ? (
            <div className="chat-item">
              Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div className="chat-item">
              No chats yet
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${
                  chat._id === conversationId
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectConversation(chat._id)
                }
              >
                <span>
                  {chat.isPinned ? "📌" : "💬"}
                </span>

                <span className="chat-title">
                  {chat.title || "New Chat"}
                </span>

                <button
                  className="delete-chat"
                  title={
                    chat.isPinned
                      ? "Unpin chat"
                      : "Pin chat"
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    togglePinConversation(chat._id);
                  }}
                >
                  {chat.isPinned ? "📌" : "📍"}
                </button>

                <button
                  className="delete-chat"
                  title="Delete chat"
                  disabled={deletingChat === chat._id}
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteConversation(chat._id);
                  }}
                >
                  {deletingChat === chat._id
                    ? "..."
                    : "🗑️"}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-action">
            ⚙️ Settings
          </button>

          <div className="profile">
            <div className="avatar">R</div>

            <div>
              <strong>Rahul</strong>
              <span>Local development</span>
            </div>

            <span className="profile-more">•••</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-logo">R</div>
            RahulGPT
          </div>

          <div className="model">
            <span className="status-dot"></span>
            RahulGPT
            <span className="model-arrow">⌄</span>
          </div>

          <button className="topbar-button">
            Share
          </button>
        </header>

        {/* CHAT AREA */}

        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-logo">R</div>

              <h1>What can I help you with?</h1>

              <p>
                Ask anything. Learn faster. Build smarter.
              </p>

              <div className="suggestions">
                <button
                  onClick={() =>
                    handleSuggestion("Explain a concept")
                  }
                >
                  <span>💡</span>
                  Explain a concept
                </button>

                <button
                  onClick={() =>
                    handleSuggestion("Help me code")
                  }
                >
                  <span>💻</span>
                  Help me code
                </button>

                <button
                  onClick={() =>
                    handleSuggestion("Build a project")
                  }
                >
                  <span>🚀</span>
                  Build a project
                </button>

                <button
                  onClick={() =>
                    handleSuggestion("Brainstorm ideas")
                  }
                >
                  <span>🧠</span>
                  Brainstorm ideas
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`message ${
                    msg.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  <div className="message-avatar">
                    {msg.role === "user" ? "R" : "✦"}
                  </div>

                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message assistant-message">
                  <div className="message-avatar">✦</div>

                  <div className="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>
          )}
        </section>

        {/* COMPOSER */}

        <div className="composer-wrapper">
          <div className="composer">
            <button
              className="attach"
              onClick={createNewChat}
              title="Start a new chat"
            >
              ＋
            </button>

            <input
              type="text"
              placeholder={
                conversationId
                  ? "Message RahulGPT..."
                  : "Create a new chat to start..."
              }
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              disabled={!conversationId || loading}
            />

            <button
              className="send"
              onClick={sendMessage}
              disabled={
                loading ||
                !conversationId ||
                !message.trim()
              }
            >
              ↑
            </button>
          </div>

          <p className="disclaimer">
            RahulGPT can make mistakes. Check important
            information.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
