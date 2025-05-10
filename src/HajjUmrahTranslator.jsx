// HajjUmrahTranslator.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { phraseCategories } from "./services/phrases";

const HajjUmrahTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ar");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("phrases");
  const [selectedPhraseLanguage, setSelectedPhraseLanguage] = useState("en");
  const [selectedCategory, setSelectedCategory] = useState("navigation");

  // API configuration
  const LIBRETRANSLATE_API_URL = "http://localhost:5000/translate";

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

  // Add this new object for category titles in different languages
  const categoryTitles = {
    navigation: {
      en: "Navigation & Directions",
      ar: "التوجيه والاتجاهات",
      ur: "رہنمائی اور سمت",
      hi: "नेविगेशन और दिशाएं",
      id: "Navigasi & Arah",
      ms: "Navigasi & Arah",
      tr: "Navigasyon ve Yönler",
      fa: "ناوبری و مسیرها",
      fr: "Navigation et Directions",
      de: "Navigation und Wegbeschreibungen",
    },
    rituals: {
      en: "Hajj & Umrah Rituals",
      ar: "مناسك الحج والعمرة",
      ur: "حج اور عمرہ کے مناسک",
      hi: "हज और उमरा के अनुष्ठान",
      id: "Ritual Haji & Umrah",
      ms: "Ritual Haji & Umrah",
      tr: "Hac ve Umre Ritüelleri",
      fa: "مناسک حج و عمره",
      fr: "Rituels du Hajj et de l'Umrah",
      de: "Hajj & Umrah Rituale",
    },
    facilities: {
      en: "Facilities & Services",
      ar: "المرافق والخدمات",
      ur: "سہولیات اور خدمات",
      hi: "सुविधाएं और सेवाएं",
      id: "Fasilitas & Layanan",
      ms: "Kemudahan & Perkhidmatan",
      tr: "Tesisler ve Hizmetler",
      fa: "تسهیلات و خدمات",
      fr: "Installations et Services",
      de: "Einrichtungen und Dienstleistungen",
    },
    emergency: {
      en: "Emergency & Medical",
      ar: "الطوارئ والطبية",
      ur: "ہنگامی اور طبی",
      hi: "आपातकालीन और चिकित्सा",
      id: "Darurat & Medis",
      ms: "Kecemasan & Perubatan",
      tr: "Acil Durum ve Tıbbi",
      fa: "اورژانس و پزشکی",
      fr: "Urgence et Médical",
      de: "Notfall und Medizin",
    },
    shopping: {
      en: "Shopping & Purchases",
      ar: "التسوق والمشتريات",
      ur: "خریداری اور خرید",
      hi: "खरीदारी और खरीद",
      id: "Belanja & Pembelian",
      ms: "Membeli-belah & Pembelian",
      tr: "Alışveriş ve Satın Alma",
      fa: "خرید و خریداری",
      fr: "Shopping et Achats",
      de: "Einkaufen und Käufe",
    },
  };

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
        secure: true,
        sameSite: "Strict",
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
        secure: true,
        sameSite: "Strict",
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

    // Input length validation
    const MAX_INPUT_LENGTH = 100;
    if (inputText.length > MAX_INPUT_LENGTH) {
      setError(
        `Input too long. Maximum allowed is ${MAX_INPUT_LENGTH} characters.`
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First try Gemini API
      try {
        const geminiResponse = await axios.post(
          process.env.REACT_APP_GEMINI_API_URL +
            "?key=" +
            process.env.REACT_APP_GEMINI_API_KEY,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Act as an expert Islamic translator for Hajj/Umrah. Translate this text from ${sourceLanguage} to ${targetLanguage} with:

1. **Terminology Rules**:
- Preserve in original Arabic:
  * Quranic verses/hadith
  * Duas (e.g. "Labbayk Allahumma Labbayk")
  * Ritual names (Tawaf, Sa'i, Wuquf)
  * Holy sites (Mina, Arafat, Jamarat)
- Translate other text naturally

2. **Format Requirements**:
- Only output the translation
- No explanations or notes
- No bullet points or formatting
- Keep Arabic script for Islamic terms

3. **Special Cases**:
- Times: Use prayer times ("after Dhuhr")
- Directions: Use pilgrim terms ("near Maqam Ibrahim")
- Standardize spellings ("Makkah" not "Mecca")

4. **For not recognized words**:
-You must stick to one way of saying incorrect word

Text to translate: "${inputText}"`,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (
          geminiResponse.data &&
          geminiResponse.data.candidates &&
          geminiResponse.data.candidates[0]
        ) {
          const translation =
            geminiResponse.data.candidates[0].content.parts[0].text;
          setOutputText(translation);
          addToHistory(inputText, translation);
          return;
        }
      } catch (geminiError) {
        console.log(
          "Gemini API failed, falling back to offline translation: " +
            geminiError
        );
      }

      // Fallback to LibreTranslate
      const requestData = {
        q: inputText,
        source: sourceLanguage,
        target: targetLanguage,
      };

      const response = await axios.post(LIBRETRANSLATE_API_URL, requestData);
      const translation = response.data.translatedText;
      setOutputText(translation);
      addToHistory(inputText, translation);
    } catch (err) {
      console.log("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add translations to history
  const addToHistory = (sourceText, translatedText) => {
    // Check if this exact translation already exists in history
    const isDuplicate = history.some(
      (item) =>
        item.sourceText === sourceText &&
        item.translatedText === translatedText &&
        item.sourceLanguage === sourceLanguage &&
        item.targetLanguage === targetLanguage
    );

    // Only add to history if it's not a duplicate
    if (!isDuplicate) {
      const newTranslation = {
        id: Date.now(),
        sourceText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp: new Date().toISOString(),
      };

      setHistory((prevHistory) => [
        newTranslation,
        ...prevHistory.slice(0, 19),
      ]);
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
    setInputText(phrase[sourceLanguage]);
    setOutputText(phrase[targetLanguage]);
  };

  // Function to use text-to-speech
  const speakText = (text, language) => {
    if (!text || !text.trim()) {
      setError("Cannot speak empty text.");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TTS Error:", err);
      setError("Unable to play audio. Please try again.");
    }
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

  return (
    <div className="hajj-umrah-translator">
      <div className="app-header">
        <h1>
          <span className="typewriter">Hajj & Umrah Translator</span>
        </h1>
        <p className="subtitle">
          Communicate effectively during your pilgrimage
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "phrases" ? "active" : ""}`}
          onClick={() => setActiveTab("phrases")}
        >
          Common Phrases
        </button>
        <button
          className={`tab ${activeTab === "translate" ? "active" : ""}`}
          onClick={() => setActiveTab("translate")}
        >
          Translate
        </button>
        <button
          className={`tab ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {activeTab === "translate" && (
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
                placeholder={`Enter text in ${getLanguageName(sourceLanguage)}`}
                dir={sourceLanguage === "ar" ? "rtl" : "ltr"}
              />
              <div className="textActions">
                <button
                  className="actionButton"
                  onClick={() => speakText(inputText, sourceLanguage)}
                >
                  🔊 Listen
                </button>
                <button
                  className="actionButton"
                  onClick={() => setInputText("")}
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            <div>
              <textarea
                className="textBox"
                value={outputText}
                readOnly
                placeholder={`Translation in ${getLanguageName(
                  targetLanguage
                )}`}
                dir={targetLanguage === "ar" ? "rtl" : "ltr"}
              />
              <div className="textActions">
                <button
                  className="actionButton"
                  onClick={() => speakText(outputText, targetLanguage)}
                >
                  🔊 Listen
                </button>
                <button
                  className="actionButton"
                  onClick={() => copyToClipboard(outputText)}
                >
                  📋 Copy
                </button>
                {outputText && (
                  <button
                    className="actionButton"
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

          {error && <div className="errorMessage">{error}</div>}

          <button
            className="translateBtn"
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onClick={translateText}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? "Translating..." : "Translate"}
          </button>
        </div>
      )}

      {activeTab === "phrases" && (
        <div className="phrases-container">
          <div className="phrases-header">
            <h2>Common Hajj & Umrah Phrases</h2>
            <div className="phrases-controls">
              <div className="category-selector">
                <select
                  className="select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {Object.entries(phraseCategories).map(([key, category]) => (
                    <option key={key} value={key}>
                      {categoryTitles[key][selectedPhraseLanguage]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="phrase-language-selector">
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
            </div>
          </div>
          <div className="phrases-list">
            {phraseCategories[selectedCategory].phrases.map((phrase, index) => (
              <div
                key={index}
                className="phrase-card"
                onClick={() => handlePhraseSelect(phrase)}
              >
                <div className="phrase-text">
                  {phrase[selectedPhraseLanguage]}
                </div>
                <div className="phrase-arabic">{phrase.ar}</div>
                <div className="phrase-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(
                        phrase[selectedPhraseLanguage],
                        selectedPhraseLanguage
                      );
                    }}
                  >
                    🔊 {getLanguageName(selectedPhraseLanguage)}
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
                    {item.sourceText}{" "}
                    <button
                      className="actionButton"
                      onClick={() =>
                        speakText(item.sourceText, item.sourceLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="history-translation">
                    <strong>{getLanguageName(item.targetLanguage)}:</strong>{" "}
                    {item.translatedText}{" "}
                    <button
                      className="actionButton"
                      onClick={() =>
                        speakText(item.translatedText, item.targetLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="history-actions">
                    <button
                      className="actionButton"
                      onClick={() => {
                        setInputText(item.sourceText);
                        setSourceLanguage(item.sourceLanguage);
                        setTargetLanguage(item.targetLanguage);
                        setActiveTab("translate");
                      }}
                    >
                      Use Again
                    </button>
                    <button
                      className="actionButton"
                      onClick={() => toggleFavorite(item)}
                    >
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
                    {item.sourceText}{" "}
                    <button
                      className="actionButton"
                      onClick={() =>
                        speakText(item.sourceText, item.sourceLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="favorite-translation">
                    <strong>{getLanguageName(item.targetLanguage)}:</strong>{" "}
                    {item.translatedText}{" "}
                    <button
                      className="actionButton"
                      onClick={() =>
                        speakText(item.translatedText, item.targetLanguage)
                      }
                    >
                      🔊
                    </button>
                  </div>
                  <div className="favorite-actions">
                    <button
                      className="actionButton"
                      onClick={() => {
                        setInputText(item.sourceText);
                        setSourceLanguage(item.sourceLanguage);
                        setTargetLanguage(item.targetLanguage);
                        setActiveTab("translate");
                      }}
                    >
                      Use Again
                    </button>
                    <button
                      className="actionButton"
                      onClick={() => toggleFavorite(item)}
                    >
                      Remove from Favorites
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HajjUmrahTranslator;
