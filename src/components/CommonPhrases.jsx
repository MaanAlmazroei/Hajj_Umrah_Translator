import React from "react";

const CommonPhrases = ({
  commonPhrases,
  selectedPhraseLanguage,
  setSelectedPhraseLanguage,
  languages,
  handlePhraseSelect,
  speakText,
}) => (
  <div className="phrases-container">
    <div className="phrases-header">
      <h2>Common Hajj & Umrah Phrases</h2>
      <select
        className="select"
        value={selectedPhraseLanguage}
        onChange={(e) => setSelectedPhraseLanguage(e.target.value)}
      >
        {languages
          .filter((lang) => lang.code !== "ar")
          .map((lang) => (
            <option key={`phrase-${lang.code}`} value={lang.code}>
              {lang.name}
            </option>
          ))}
      </select>
    </div>
    <div className="phrases-list">
      {commonPhrases.map((phrase, index) => (
        <div
          key={index}
          className="phrase-card"
          onClick={() => handlePhraseSelect(phrase)}
        >
          <div className="phrase-text">{phrase[selectedPhraseLanguage]}</div>
          <div className="phrase-arabic">{phrase.ar}</div>
          <div className="phrase-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(phrase[selectedPhraseLanguage], selectedPhraseLanguage);
              }}
            >
              🔊 {selectedPhraseLanguage}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(phrase.ar, "ar");
              }}
            >
              🔊 Arabic
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CommonPhrases;