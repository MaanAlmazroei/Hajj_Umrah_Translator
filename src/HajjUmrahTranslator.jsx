// HajjUmrahTranslator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HajjUmrahTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ar');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('translate');

  // Common phrases for Hajj and Umrah
  const commonPhrases = [
    { en: "Where is the Kaaba?", ar: "أين الكعبة؟" },
    { en: "How do I perform Tawaf?", ar: "كيف أؤدي الطواف؟" },
    { en: "Where is the nearest prayer area?", ar: "أين أقرب مكان للصلاة؟" },
    { en: "I need water", ar: "أحتاج إلى ماء" },
    { en: "Where can I find Zamzam water?", ar: "أين يمكنني الحصول على ماء زمزم؟" },
    { en: "How do I get to Mina?", ar: "كيف أصل إلى منى؟" },
    { en: "Which way to Arafat?", ar: "أي طريق إلى عرفات؟" },
    { en: "I need medical assistance", ar: "أحتاج إلى مساعدة طبية" },
    { en: "Where is the nearest bathroom?", ar: "أين أقرب دورة مياه؟" },
    { en: "How much does this cost?", ar: "كم تكلفة هذا؟" }
  ];

  // Available languages
  const languages = [
    { code: 'ar', name: 'Arabic' },
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'Urdu' },
    { code: 'hi', name: 'Hindi' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'tr', name: 'Turkish' },
    { code: 'fa', name: 'Persian' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  // Load saved API key and translation history from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setSavedApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }

    const storedHistory = localStorage.getItem('translationHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }

    const storedFavorites = localStorage.getItem('translationFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save translation history to localStorage
  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('translationFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Function to save API key
  const saveApiKey = () => {
    localStorage.setItem('geminiApiKey', apiKey);
    setSavedApiKey(apiKey);
  };

  // Function to handle translation
  const translateText = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (!savedApiKey) {
      setError('Please save your Gemini API key first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
        const response = await axios.post(
            `/api/gemini/models/gemini-pro:generateContent?key=${savedApiKey}`,
            {
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ]
            }
          );

      // Extract the translation from response
      const translation = response.data.candidates[0].content.parts[0].text;
  setOutputText(translation);

      // Add to history
      const newTranslation = {
        id: Date.now(),
        sourceText: inputText,
        translatedText: translation,
        sourceLanguage,
        targetLanguage,
        timestamp: new Date().toISOString()
      };

      setHistory(prevHistory => [newTranslation, ...prevHistory.slice(0, 19)]);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get language name from code
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Function to add/remove favorites
  const toggleFavorite = (translation) => {
    const isFavorite = favorites.some(fav => fav.id === translation.id);
    
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== translation.id));
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
    setInputText(phrase[sourceLanguage] || phrase.en);
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
    localStorage.removeItem('translationHistory');
  };

  return (
    <div className="hajj-umrah-translator">
      <div className="app-header">
        <h1>Hajj & Umrah Translator</h1>
        <p>Communicate effectively during your pilgrimage</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'translate' ? 'active' : ''}`}
          onClick={() => setActiveTab('translate')}
        >
          Translate
        </button>
        <button 
          className={`tab ${activeTab === 'phrases' ? 'active' : ''}`}
          onClick={() => setActiveTab('phrases')}
        >
          Common Phrases
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'translate' && (
        <div className="translator-container">
          <div className="language-selectors">
            <select 
              value={sourceLanguage} 
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            
            <button onClick={swapLanguages} className="swap-btn">
              ⇄
            </button>
            
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="translation-boxes">
            <div className="input-box">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter text in ${getLanguageName(sourceLanguage)}`}
                rows={5}
              />
              <div className="text-actions">
                <button onClick={() => speakText(inputText, sourceLanguage)}>
                  🔊 Listen
                </button>
                <button onClick={() => setInputText('')}>
                  ✕ Clear
                </button>
              </div>
            </div>

            <div className="output-box">
              <textarea
                value={outputText}
                readOnly
                placeholder={`Translation in ${getLanguageName(targetLanguage)}`}
                rows={5}
              />
              <div className="text-actions">
                <button onClick={() => speakText(outputText, targetLanguage)}>
                  🔊 Listen
                </button>
                <button onClick={() => copyToClipboard(outputText)}>
                  📋 Copy
                </button>
                {outputText && (
                  <button onClick={() => toggleFavorite({
                    id: Date.now(),
                    sourceText: inputText,
                    translatedText: outputText,
                    sourceLanguage,
                    targetLanguage,
                    timestamp: new Date().toISOString()
                  })}>
                    ⭐ Favorite
                  </button>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={translateText} 
            disabled={isLoading || !inputText.trim() || !savedApiKey}
            className="translate-btn"
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {activeTab === 'phrases' && (
        <div className="phrases-container">
          <h2>Common Hajj & Umrah Phrases</h2>
          <div className="phrases-list">
            {commonPhrases.map((phrase, index) => (
              <div key={index} className="phrase-card" onClick={() => handlePhraseSelect(phrase)}>
                <div className="phrase-english">{phrase.en}</div>
                <div className="phrase-arabic">{phrase.ar}</div>
                <div className="phrase-actions">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    speakText(phrase.en, 'en');
                  }}>
                    🔊 EN
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    speakText(phrase.ar, 'ar');
                  }}>
                    🔊 AR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
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
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-original">
                    <strong>{getLanguageName(item.sourceLanguage)}:</strong> {item.sourceText}
                    <button onClick={() => speakText(item.sourceText, item.sourceLanguage)}>
                      🔊
                    </button>
                  </div>
                  <div className="history-translation">
                    <strong>{getLanguageName(item.targetLanguage)}:</strong> {item.translatedText}
                    <button onClick={() => speakText(item.translatedText, item.targetLanguage)}>
                      🔊
                    </button>
                  </div>
                  <div className="history-actions">
                    <button onClick={() => {
                      setInputText(item.sourceText);
                      setSourceLanguage(item.sourceLanguage);
                      setTargetLanguage(item.targetLanguage);
                      setActiveTab('translate');
                    }}>
                      Use Again
                    </button>
                    <button onClick={() => toggleFavorite(item)}>
                      {favorites.some(fav => fav.id === item.id) ? '★ Favorited' : '☆ Add to Favorites'}
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

      {activeTab === 'favorites' && (
        <div className="favorites-container">
          <h2>Favorite Translations</h2>
          
          {favorites.length === 0 ? (
            <p>No favorites yet. Add translations to your favorites for quick access.</p>
          ) : (
            <div className="favorites-list">
              {favorites.map(item => (
                <div key={item.id} className="favorite-item">
                  <div className="favorite-original">
                    <strong>{getLanguageName(item.sourceLanguage)}:</strong> {item.sourceText}
                    <button onClick={() => speakText(item.sourceText, item.sourceLanguage)}>
                      🔊
                    </button>
                  </div>
                  <div className="favorite-translation">
                    <strong>{getLanguageName(item.targetLanguage)}:</strong> {item.translatedText}
                    <button onClick={() => speakText(item.translatedText, item.targetLanguage)}>
                      🔊
                    </button>
                  </div>
                  <div className="favorite-actions">
                    <button onClick={() => {
                      setInputText(item.sourceText);
                      setSourceLanguage(item.sourceLanguage);
                      setTargetLanguage(item.targetLanguage);
                      setActiveTab('translate');
                    }}>
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

      {activeTab === 'settings' && (
        <div className="settings-container">
          <h2>API Settings</h2>
          <div className="api-key-section">
            <p>Enter your Gemini API key to enable translations:</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API Key"
              className="api-key-input"
            />
            <button onClick={saveApiKey} className="save-api-btn">
              Save API Key
            </button>
            {savedApiKey && (
              <p className="api-status">API Key is saved. Translation is enabled.</p>
            )}
          </div>
          
          <div className="settings-info">
            <h3>About Hajj & Umrah Translator</h3>
            <p>This application is specifically designed to help pilgrims communicate effectively during Hajj and Umrah.</p>
            <p>Features:</p>
            <ul>
              <li>Translate between 10 languages commonly spoken by pilgrims</li>
              <li>Save favorite translations for quick access</li>
              <li>Common religious phrases related to Hajj and Umrah</li>
              <li>Text-to-speech capability for better communication</li>
              <li>Translation history to recall previous conversations</li>
            </ul>
            <p>To get started, please enter your Gemini API key above.</p>
          </div>
        </div>
      )}

      <div className="offline-note">
        <h3>Offline Mode Features</h3>
        <p>Common phrases, favorites, and history are available offline. Translation requires internet connection.</p>
      </div>
    </div>
  );
};

export default HajjUmrahTranslator;