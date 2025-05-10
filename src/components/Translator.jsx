import React from "react";

const Translator = ({
  inputText,
  setInputText,
  outputText,
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  languages,
  isLoading,
  translateText,
  error,
  swapLanguages,
  speakText,
  copyToClipboard,
  toggleFavorite,
}) => (
  <div className="translatorContainer">
    <div className="languageSelectors">
      <select
        className="select"
        value={sourceLanguage}
        onChange={(e) => setSourceLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={`source-${lang.code}`} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button onClick={swapLanguages} className="swapBtn">
        ⇄
      </button>

      <select
        className="select"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={`target-${lang.code}`} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>

    <div className="translationBoxes">
      <div>
        <textarea
          className="textBox"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter text in ${sourceLanguage}`}
        />
        <div className="textActions">
          <button onClick={() => speakText(inputText, sourceLanguage)}>
            🔊 Listen
          </button>
          <button onClick={() => setInputText("")}>✕ Clear</button>
        </div>
      </div>

      <div>
        <textarea
          className="textBox"
          value={outputText}
          readOnly
          placeholder={`Translation in ${targetLanguage}`}
        />
        <div className="textActions">
          <button onClick={() => speakText(outputText, targetLanguage)}>
            🔊 Listen
          </button>
          <button onClick={() => copyToClipboard(outputText)}>📋 Copy</button>
          {outputText && (
            <button
              onClick={() =>
                toggleFavorite({
                  id: Date.now(),
                  sourceText: inputText,
                  translatedText: outputText,
                  sourceLanguage,
                  targetLanguage,
                })
              }
            >
              ⭐ Favorite
            </button>
          )}
        </div>
      </div>
    </div>

    <button
      className="translateBtn"
      onClick={translateText}
      disabled={isLoading || !inputText.trim()}
    >
      {isLoading ? "Translating..." : "Translate"}
    </button>

    {error && <div className="errorMessage">{error}</div>}
  </div>
);

export default Translator;