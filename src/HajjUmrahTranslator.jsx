// HajjUmrahTranslator.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const HajjUmrahTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ar");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("translate");

  // API key
  const API_URL = process.env.REACT_APP_API_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;

  // Common phrases for Hajj and Umrah
  const commonPhrases = [
    { en: "Where is the Kaaba?", ar: "أين الكعبة؟" },
    { en: "How do I perform Tawaf?", ar: "كيف أؤدي الطواف؟" },
    { en: "Where is the nearest prayer area?", ar: "أين أقرب مكان للصلاة؟" },
    { en: "I need water", ar: "أحتاج إلى ماء" },
    {
      en: "Where can I find Zamzam water?",
      ar: "أين يمكنني الحصول على ماء زمزم؟",
    },
    { en: "How do I get to Mina?", ar: "كيف أصل إلى منى؟" },
    { en: "Which way to Arafat?", ar: "أي طريق إلى عرفات؟" },
    { en: "I need medical assistance", ar: "أحتاج إلى مساعدة طبية" },
    { en: "Where is the nearest bathroom?", ar: "أين أقرب دورة مياه؟" },
    { en: "How much does this cost?", ar: "كم تكلفة هذا؟" },
  ];

  // Available languages
  const languages = [
    { code: "ar", name: "Arabic" },
    { code: "en", name: "English" },
    { code: "ur", name: "Urdu" },
    { code: "hi", name: "Hindi" },
    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },
    { code: "tr", name: "Turkish" },
    { code: "fa", name: "Persian" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  // Load translation history from cookies
  useEffect(() => {
    const storedHistory = Cookies.get("translationHistory");
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error("Error parsing history from cookies:", error);
        setHistory([]);
      }
    }

    const storedFavorites = Cookies.get("translationFavorites");
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error("Error parsing favorites from cookies:", error);
        setFavorites([]);
      }
    }
  }, []);

  // Save translation history to cookies
  useEffect(() => {
    if (history.length > 0) {
      Cookies.set("translationHistory", JSON.stringify(history), {
        expires: 365,
      }); // Cookie expires in 1 year
    } else {
      Cookies.remove("translationHistory");
    }
  }, [history]);

  // Save favorites to cookies
  useEffect(() => {
    if (favorites.length > 0) {
      Cookies.set("translationFavorites", JSON.stringify(favorites), {
        expires: 365,
      }); // Cookie expires in 1 year
    } else {
      Cookies.remove("translationFavorites");
    }
  }, [favorites]);

  // Function to handle translation
  const translateText = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
        contents: [
          {
            parts: [
              {
                text: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Provide ONLY the direct translation without any explanations, examples, or additional context. Do not include any markdown formatting, bullet points, or explanatory text:\n${inputText}`,
              },
            ],
          },
        ],
      });

      // استخراج الترجمة
      const translation = response.data.candidates[0].content.parts[0].text;
      // تنظيف النص من أي علامات markdown أو نصوص إضافية
      const cleanTranslation = translation
        .replace(/[\*\#\-\_\`]/g, "") // إزالة علامات markdown
        .replace(/^\s*[\n\r]+/g, "") // إزالة الأسطر الفارغة في البداية
        .replace(/[\n\r]+\s*$/g, "") // إزالة الأسطر الفارغة في النهاية
        .trim(); // إزالة المسافات الزائدة

      setOutputText(cleanTranslation);

      // Check if this exact translation already exists in history
      const isDuplicate = history.some(
        (item) =>
          item.sourceText === inputText &&
          item.translatedText === cleanTranslation &&
          item.sourceLanguage === sourceLanguage &&
          item.targetLanguage === targetLanguage
      );

      // Only add to history if it's not a duplicate
      if (!isDuplicate) {
        const newTranslation = {
          id: Date.now(),
          sourceText: inputText,
          translatedText: cleanTranslation,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString(),
        };

        setHistory((prevHistory) => [
          newTranslation,
          ...prevHistory.slice(0, 19),
        ]);
      }
    } catch (err) {
      console.error("Translation error:", err);
      setError("Failed to translate. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get language name from code
  const getLanguageName = (code) => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  // Function to add/remove favorites
  const toggleFavorite = (translation) => {
    const isFavorite = favorites.some((fav) => fav.id === translation.id);

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== translation.id));
    } else {
      setFavorites([...favorites, translation]);
    }
  };

  // Function to swap languages
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  // Function to handle common phrase selection
  const handlePhraseSelect = (phrase) => {
    if (sourceLanguage === "ar") {
      setInputText(phrase.ar);
      setOutputText(phrase.en);
    } else {
      setInputText(phrase.en);
      setOutputText(phrase.ar);
    }
  };

  // Function to use text-to-speech
  const speakText = (text, language) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
    Cookies.remove("translationHistory");
  };

  // Add CSS styles at the top of the component
  const styles = {
    translatorContainer: {
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    languageSelectors: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "15px",
      marginBottom: "20px",
    },
    select: {
      padding: "10px 15px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "16px",
      width: "200px",
      backgroundColor: "#fff",
    },
    swapBtn: {
      padding: "8px 12px",
      borderRadius: "50%",
      border: "1px solid #ddd",
      backgroundColor: "#fff",
      cursor: "pointer",
      fontSize: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    translationBoxes: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "40px",
      marginBottom: "20px",
      padding: "20px",
    },
    textBox: {
      width: "100%",
      height: "200px",
      padding: "15px",
      borderRadius: "8px",
      border: "2px solid #ddd",
      fontSize: "16px",
      resize: "none",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      outline: "none",
      transition: "border-color 0.3s ease",
      backgroundColor: "#fafafa",
      lineHeight: "1.5",
      overflowY: "auto",
      margin: "10px 0",
    },
    textActions: {
      display: "flex",
      gap: "10px",
      marginTop: "10px",
    },
    actionButton: {
      padding: "8px 15px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      transition: "all 0.3s ease",
    },
    translateBtn: {
      width: "100%",
      padding: "15px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#4CAF50",
      color: "white",
      fontSize: "18px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    errorMessage: {
      color: "#ff0000",
      textAlign: "center",
      marginTop: "10px",
    },
  };

  return (
    <div className="hajj-umrah-translator">
      <div className="app-header">
        <h1>Hajj & Umrah Translator</h1>
        <p>Communicate effectively during your pilgrimage</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "translate" ? "active" : ""}`}
          onClick={() => setActiveTab("translate")}
        >
          Translate
        </button>
        <button
          className={`tab ${activeTab === "phrases" ? "active" : ""}`}
          onClick={() => setActiveTab("phrases")}
        >
          Common Phrases
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </button>
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          About
        </button>
      </div>

      {activeTab === "translate" && (
        <div style={styles.translatorContainer}>
          <div style={styles.languageSelectors}>
            <select
              style={styles.select}
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button onClick={swapLanguages} style={styles.swapBtn}>
              ⇄
            </button>

            <select
              style={styles.select}
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

          <div style={styles.translationBoxes}>
            <div>
              <textarea
                style={{
                  ...styles.textBox,
                  backgroundColor: "#ffffff",
                }}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter text in ${getLanguageName(sourceLanguage)}`}
                dir={sourceLanguage === "ar" ? "rtl" : "ltr"}
              />
              <div style={styles.textActions}>
                <button
                  style={styles.actionButton}
                  onClick={() => speakText(inputText, sourceLanguage)}
                >
                  🔊 Listen
                </button>
                <button
                  style={styles.actionButton}
                  onClick={() => setInputText("")}
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            <div>
              <textarea
                style={{
                  ...styles.textBox,
                  backgroundColor: "#ffffff",
                  cursor: "default",
                }}
                value={outputText}
                readOnly
                placeholder={`Translation in ${getLanguageName(
                  targetLanguage
                )}`}
                dir={targetLanguage === "ar" ? "rtl" : "ltr"}
              />
              <div style={styles.textActions}>
                <button
                  style={styles.actionButton}
                  onClick={() => speakText(outputText, targetLanguage)}
                >
                  🔊 Listen
                </button>
                <button
                  style={styles.actionButton}
                  onClick={() => copyToClipboard(outputText)}
                >
                  📋 Copy
                </button>
                {outputText && (
                  <button
                    style={styles.actionButton}
                    onClick={() =>
                      toggleFavorite({
                        id: Date.now(),
                        sourceText: inputText,
                        translatedText: outputText,
                        sourceLanguage,
                        targetLanguage,
                        timestamp: new Date().toISOString(),
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
            style={{
              ...styles.translateBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onClick={translateText}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? "Translating..." : "Translate"}
          </button>

          {error && <div style={styles.errorMessage}>{error}</div>}
        </div>
      )}

      {activeTab === "phrases" && (
        <div className="phrases-container">
          <h2>Common Hajj & Umrah Phrases</h2>
          <div className="phrases-list">
            {commonPhrases.map((phrase, index) => (
              <div
                key={index}
                className="phrase-card"
                onClick={() => handlePhraseSelect(phrase)}
              >
                <div className="phrase-english">{phrase.en}</div>
                <div className="phrase-arabic">{phrase.ar}</div>
                <div className="phrase-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(phrase.en, "en");
                    }}
                  >
                    🔊 EN
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(phrase.ar, "ar");
                    }}
                  >
                    🔊 AR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
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
                    <strong>{getLanguageName(item.sourceLanguage)}:</strong>{" "}
                    {item.sourceText}
                    <button
                      onClick={() =>
                        speakText(item.sourceText, item.sourceLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="history-translation">
                    <strong>{getLanguageName(item.targetLanguage)}:</strong>{" "}
                    {item.translatedText}
                    <button
                      onClick={() =>
                        speakText(item.translatedText, item.targetLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="history-actions">
                    <button
                      onClick={() => {
                        setInputText(item.sourceText);
                        setSourceLanguage(item.sourceLanguage);
                        setTargetLanguage(item.targetLanguage);
                        setActiveTab("translate");
                      }}
                    >
                      Use Again
                    </button>
                    <button onClick={() => toggleFavorite(item)}>
                      {favorites.some((fav) => fav.id === item.id)
                        ? "★ Favorited"
                        : "☆ Add to Favorites"}
                    </button>
                  </div>
                  <div className="history-time">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="favorites-container">
          <h2>Favorite Translations</h2>

          {favorites.length === 0 ? (
            <p>
              No favorites yet. Add translations to your favorites for quick
              access.
            </p>
          ) : (
            <div className="favorites-list">
              {favorites.map((item) => (
                <div key={item.id} className="favorite-item">
                  <div className="favorite-original">
                    <strong>{getLanguageName(item.sourceLanguage)}:</strong>{" "}
                    {item.sourceText}
                    <button
                      onClick={() =>
                        speakText(item.sourceText, item.sourceLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="favorite-translation">
                    <strong>{getLanguageName(item.targetLanguage)}:</strong>{" "}
                    {item.translatedText}
                    <button
                      onClick={() =>
                        speakText(item.translatedText, item.targetLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="favorite-actions">
                    <button
                      onClick={() => {
                        setInputText(item.sourceText);
                        setSourceLanguage(item.sourceLanguage);
                        setTargetLanguage(item.targetLanguage);
                        setActiveTab("translate");
                      }}
                    >
                      Use Again
                    </button>
                    <button onClick={() => toggleFavorite(item)}>
                      Remove from Favorites
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="settings-container">
          <h2>About</h2>
          <div className="settings-info">
            <h3>About Hajj & Umrah Translator</h3>
            <p>
              This application is specifically designed to help pilgrims
              communicate effectively during Hajj and Umrah.
            </p>
            <p>Features:</p>
            <ul>
              <li>
                Translate between 10 languages commonly spoken by pilgrims
              </li>
              <li>Save favorite translations for quick access</li>
              <li>Common religious phrases related to Hajj and Umrah</li>
              <li>Text-to-speech capability for better communication</li>
              <li>Translation history to recall previous conversations</li>
            </ul>
          </div>
        </div>
      )}

      <div className="offline-note">
        <h3>Offline Mode Features</h3>
        <p>
          Common phrases, favorites, and history are available offline.
          Translation requires internet connection.
        </p>
      </div>
    </div>
  );
};

export default HajjUmrahTranslator;
