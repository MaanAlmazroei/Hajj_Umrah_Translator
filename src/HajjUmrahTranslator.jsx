// HajjUmrahTranslator.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { phraseCategories } from './services/phrases';

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
  const [selectedCategory, setSelectedCategory] = useState('navigation');

  // API configuration
  const LIBRETRANSLATE_API_URL = "http://localhost:5000/translate";

  // Common phrases for Hajj and Umrah
  const commonPhrases = [
    {
      en: "Where is the Kaaba?",
      ar: "أين الكعبة؟",
      ur: "کعبہ کہاں ہے؟",
      hi: "काबा कहाँ है?",
      id: "Di mana Ka'bah?",
      ms: "Di manakah Kaabah?",
      tr: "Kabe nerede?",
      fa: "کعبه کجاست؟",
      fr: "Où est la Kaaba ?",
      de: "Wo ist die Kaaba?",
    },
    {
      en: "How do I perform Tawaf?",
      ar: "كيف أؤدي الطواف؟",
      ur: "طواف کیسے کریں؟",
      hi: "तवाफ कैसे करें?",
      id: "Bagaimana cara melakukan Tawaf?",
      ms: "Bagaimana cara melakukan Tawaf?",
      tr: "Tavaf nasıl yapılır?",
      fa: "چگونه طواف کنم؟",
      fr: "Comment effectuer le Tawaf ?",
      de: "Wie führe ich den Tawaf durch?",
    },
    {
      en: "Where is the nearest prayer area?",
      ar: "أين أقرب مكان للصلاة؟",
      ur: "قریب ترین نماز کی جگہ کہاں ہے؟",
      hi: "निकटतम प्रार्थना स्थल कहाँ है?",
      id: "Di mana tempat shalat terdekat?",
      ms: "Di manakah tempat solat yang terdekat?",
      tr: "En yakın namaz alanı nerede?",
      fa: "نزدیک‌ترین محل نماز کجاست؟",
      fr: "Où est la zone de prière la plus proche ?",
      de: "Wo ist der nächste Gebetsbereich?",
    },
    {
      en: "I need water",
      ar: "أحتاج إلى ماء",
      ur: "مجھے پانی چاہیے",
      hi: "मुझे पानी चाहिए",
      id: "Saya butuh air",
      ms: "Saya perlukan air",
      tr: "Suya ihtiyacım var",
      fa: "من به آب نیاز دارم",
      fr: "J'ai besoin d'eau",
      de: "Ich brauche Wasser",
    },
    {
      en: "Where can I find Zamzam water?",
      ar: "أين يمكنني الحصول على ماء زمزم؟",
      ur: "زمزم کا پانی کہاں سے مل سکتا ہے؟",
      hi: "ज़मज़म का पानी कहाँ मिल सकता है?",
      id: "Di mana saya bisa mendapatkan air Zamzam?",
      ms: "Di mana saya boleh mendapatkan air Zamzam?",
      tr: "Zemzem suyunu nereden bulabilirim?",
      fa: "کجا می‌توانم آب زمزم پیدا کنم؟",
      fr: "Où puis-je trouver de l'eau de Zamzam ?",
      de: "Wo finde ich Zamzam-Wasser?",
    },
    {
      en: "How do I get to Mina?",
      ar: "كيف أصل إلى منى؟",
      ur: "منیٰ تک کیسے پہنچوں؟",
      hi: "मिना तक कैसे पहुंचें?",
      id: "Bagaimana cara ke Mina?",
      ms: "Bagaimana cara ke Mina?",
      tr: "Mina'ya nasıl giderim?",
      fa: "چگونه به منا بروم؟",
      fr: "Comment aller à Mina ?",
      de: "Wie komme ich nach Mina?",
    },
    {
      en: "Which way to Arafat?",
      ar: "أي طريق إلى عرفات؟",
      ur: "عرفات کا راستہ کون سا ہے؟",
      hi: "अरफात का रास्ता कौन सा है?",
      id: "Jalan mana yang menuju Arafah?",
      ms: "Jalan mana yang menuju ke Arafah?",
      tr: "Arafat'a hangi yoldan gidilir?",
      fa: "کدام مسیر به عرفات می‌رود؟",
      fr: "Quel chemin pour Arafat ?",
      de: "Welcher Weg führt nach Arafat?",
    },
    {
      en: "I need medical assistance",
      ar: "أحتاج إلى مساعدة طبية",
      ur: "مجھے طبی امداد چاہیے",
      hi: "मुझे चिकित्सा सहायता चाहिए",
      id: "Saya butuh bantuan medis",
      ms: "Saya perlukan bantuan perubatan",
      tr: "Tıbbi yardıma ihtiyacım var",
      fa: "من به کمک پزشکی نیاز دارم",
      fr: "J'ai besoin d'assistance médicale",
      de: "Ich brauche medizinische Hilfe",
    },
    {
      en: "Where is the nearest bathroom?",
      ar: "أين أقرب دورة مياه؟",
      ur: "قریب ترین باتھ روم کہاں ہے؟",
      hi: "निकटतम शौचालय कहाँ है?",
      id: "Di mana kamar mandi terdekat?",
      ms: "Di manakah tandas yang terdekat?",
      tr: "En yakın tuvalet nerede?",
      fa: "نزدیک‌ترین دستشویی کجاست؟",
      fr: "Où sont les toilettes les plus proches ?",
      de: "Wo ist die nächste Toilette?",
    },
    {
      en: "How much does this cost?",
      ar: "كم تكلفة هذا؟",
      ur: "اس کی قیمت کتنی ہے؟",
      hi: "इसकी कीमत कितनी है?",
      id: "Berapa harganya?",
      ms: "Berapakah harganya?",
      tr: "Bu ne kadar?",
      fa: "قیمت این چقدر است؟",
      fr: "Combien ça coûte ?",
      de: "Wie viel kostet das?",
    },
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
      de: "Navigation und Wegbeschreibungen"
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
      de: "Hajj & Umrah Rituale"
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
      de: "Einrichtungen und Dienstleistungen"
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
      de: "Notfall und Medizin"
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
      de: "Einkaufen und Käufe"
    }
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

  // Function to clear favorites
  const clearFavorites = () => {
    setFavorites([]);
    Cookies.remove("translationFavorites");
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
        <div className="phrases-container">
          <div className="phrases-header">
            <h2>Translation History</h2>
            <div className="phrases-controls">
              {history.length > 0 && (
                <button onClick={clearHistory} className="clear-btn">
                  Clear All History
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="empty-message">
              <p>No translation history yet.</p>
              <p>Your translations will appear here.</p>
            </div>
          ) : (
            <div className="phrases-list">
              {history.map((item) => (
                <div key={item.id} className="phrase-card">
                  <div className="phrase-text">
                    {item.sourceText}
                  </div>
                  <div className="phrase-arabic">
                    {item.translatedText}
                  </div>
                  <div className="phrase-actions">
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
                    <button
                      onClick={() => toggleFavorite(item)}
                      className={favorites.some(fav => fav.id === item.id) ? "favorited" : ""}
                    >
                      {favorites.some(fav => fav.id === item.id) ? "★ Favorited" : "☆ Add to Favorites"}
                    </button>
                    <button
                      onClick={() => speakText(item.translatedText, item.targetLanguage)}
                    >
                      🔊 Listen
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
        <div className="phrases-container">
          <div className="phrases-header">
            <h2>Favorite Translations</h2>
            <div className="phrases-controls">
              {favorites.length > 0 && (
                <button onClick={clearFavorites} className="clear-btn">
                  Clear All Favorites
                </button>
              )}
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="empty-message">
              <p>No favorites yet.</p>
              <p>Add translations to your favorites for quick access.</p>
            </div>
          ) : (
            <div className="phrases-list">
              {favorites.map((item) => (
                <div key={item.id} className="phrase-card">
                  <div className="phrase-text">
                     {item.sourceText}
                  </div>
                  <div className="phrase-arabic">
                    {item.translatedText}
                  </div>
                  <div className="phrase-actions">
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
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="favorited"
                    >
                      ★ Remove Favorite
                    </button>
                    <button
                      onClick={() => speakText(item.translatedText, item.targetLanguage)}
                    >
                      🔊 Listen
                    </button>
                  </div>
                  <div className="history-time">
                    Saved on {new Date(item.timestamp).toLocaleDateString()}
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