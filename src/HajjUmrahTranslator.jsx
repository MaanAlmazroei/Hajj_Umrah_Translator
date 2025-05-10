import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Translator from "./components/Translator";
import CommonPhrases from "./components/CommonPhrases";
import History from "./components/History";
import Favorites from "./components/Favorites";
import About from "./components/About";
import OfflineNote from "./components/OfflineNote";

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
  const [selectedPhraseLanguage, setSelectedPhraseLanguage] = useState("en");

  const LIBRETRANSLATE_API_URL = "http://localhost:5000/translate";

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

  useEffect(() => {
    if (history.length > 0) {
      Cookies.set("translationHistory", JSON.stringify(history), {
        expires: 365,
        secure: true,
        sameSite: "Strict",
      });
    } else {
      Cookies.remove("translationHistory");
    }
  }, [history]);

  useEffect(() => {
    if (favorites.length > 0) {
      Cookies.set("translationFavorites", JSON.stringify(favorites), {
        expires: 365,
        secure: true,
        sameSite: "Strict",
      });
    } else {
      Cookies.remove("translationFavorites");
    }
  }, [favorites]);

  const translateText = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    const MAX_INPUT_LENGTH = 500;
    if (inputText.length > MAX_INPUT_LENGTH) {
      setError(
        `Input too long. Maximum allowed is ${MAX_INPUT_LENGTH} characters.`
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const requestData = {
        q: inputText,
        source: sourceLanguage,
        target: targetLanguage,
      };

      const response = await axios.post(LIBRETRANSLATE_API_URL, requestData);

      const translation = response.data.translatedText;
      setOutputText(translation);

      const isDuplicate = history.some(
        (item) =>
          item.sourceText === inputText &&
          item.translatedText === translation &&
          item.sourceLanguage === sourceLanguage &&
          item.targetLanguage === targetLanguage
      );

      if (!isDuplicate) {
        const newTranslation = {
          id: Date.now(),
          sourceText: inputText,
          translatedText: translation,
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

      if (err.message.includes("Network Error")) {
        setError(
          "Cannot connect to local LibreTranslate server. Please ensure it's running."
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageName = (code) => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  const toggleFavorite = (translation) => {
    const isFavorite = favorites.some((fav) => fav.id === translation.id);

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== translation.id));
    } else {
      setFavorites([...favorites, translation]);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  const handlePhraseSelect = (phrase) => {
    setInputText(phrase[sourceLanguage]);
    setOutputText(phrase[targetLanguage]);
  };

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
    Cookies.remove("translationHistory");
  };

  return (
    <div className="hajj-umrah-translator">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "translate" && (
        <Translator
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          sourceLanguage={sourceLanguage}
          setSourceLanguage={setSourceLanguage}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          languages={languages}
          isLoading={isLoading}
          translateText={translateText}
          error={error}
          swapLanguages={swapLanguages}
          speakText={speakText}
          copyToClipboard={copyToClipboard}
          toggleFavorite={toggleFavorite}
        />
      )}

      {activeTab === "phrases" && (
        <CommonPhrases
          commonPhrases={commonPhrases}
          selectedPhraseLanguage={selectedPhraseLanguage}
          setSelectedPhraseLanguage={setSelectedPhraseLanguage}
          languages={languages}
          handlePhraseSelect={handlePhraseSelect}
          speakText={speakText}
        />
      )}

      {activeTab === "history" && (
        <History
          history={history}
          clearHistory={clearHistory}
          speakText={speakText}
          toggleFavorite={toggleFavorite}
        />
      )}

      {activeTab === "favorites" && (
        <Favorites
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          speakText={speakText}
        />
      )}

      {activeTab === "about" && <About />}
      <OfflineNote />
    </div>
  );
};

export default HajjUmrahTranslator;
