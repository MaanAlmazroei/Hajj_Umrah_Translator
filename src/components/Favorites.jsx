import React from "react";

const Favorites = ({ favorites, toggleFavorite, speakText }) => (
  <div className="favorites-container">
    <h2>Favorite Translations</h2>
    {favorites.length === 0 ? (
      <p>No favorites yet.</p>
    ) : (
      <div className="favorites-list">
        {favorites.map((item) => (
          <div key={item.id} className="favorite-item">
            <div className="favorite-original">
              <strong>{item.sourceLanguage}:</strong> {item.sourceText}
              <button onClick={() => speakText(item.sourceText, item.sourceLanguage)}>
                🔊
              </button>
            </div>
            <div className="favorite-translation">
              <strong>{item.targetLanguage}:</strong> {item.translatedText}
              <button onClick={() => speakText(item.translatedText, item.targetLanguage)}>
                🔊
              </button>
            </div>
            <button onClick={() => toggleFavorite(item)}>Remove</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Favorites;