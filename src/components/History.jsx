import React from "react";

const History = ({ history, clearHistory, speakText, toggleFavorite }) => (
  <div className="history-container">
    <div className="history-header">
      <h2>Translation History</h2>
      {history.length > 0 && (
        <button onClick={clearHistory} className="clear-btn">
          Clear History
        </button>
      )}
    </div>
    {history.length === 0 ? (
      <p>No translation history yet.</p>
    ) : (
      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-original">
              <strong>{item.sourceLanguage}:</strong> {item.sourceText}
              <button onClick={() => speakText(item.sourceText, item.sourceLanguage)}>
                🔊
              </button>
            </div>
            <div className="history-translation">
              <strong>{item.targetLanguage}:</strong> {item.translatedText}
              <button onClick={() => speakText(item.translatedText, item.targetLanguage)}>
                🔊
              </button>
            </div>
            <button onClick={() => toggleFavorite(item)}>☆ Favorite</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default History;