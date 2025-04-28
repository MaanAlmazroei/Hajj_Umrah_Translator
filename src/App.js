// App.js
import React from 'react';
import HajjUmrahTranslator from './HajjUmrahTranslator';
import './HajjUmrahTranslator.css';

function App() {
  return (
    <div className="App">
      <HajjUmrahTranslator />
    </div>
  );
}

export default App;

// README.md - Installation Instructions
/*
# Hajj & Umrah AI Translator

A React-based translator specifically designed for pilgrims performing Hajj and Umrah, with features tailored to religious context and pilgrim needs.

## Setup Instructions

1. **Create a new React app**
   ```
   npx create-react-app hajj-umrah-translator
   cd hajj-umrah-translator
   ```

2. **Install required dependencies**
   ```
   npm install axios
   ```

3. **Replace the files**
   - Copy the HajjUmrahTranslator.js file to your src folder
   - Copy the HajjUmrahTranslator.css file to your src folder
   - Update your App.js as shown in the example

4. **Get a Gemini API key**
   - Go to https://ai.google.dev/ 
   - Sign in and create a new API key
   - Save this key to use in the application

5. **Start the application**
   ```
   npm start
   ```

6. **Enter your API key**
   - Go to the Settings tab in the application
   - Enter and save your Gemini API key

## Features

- Translation between 10 common languages for pilgrims
- Common phrases specifically for Hajj and Umrah
- Text-to-speech functionality
- Translation history and favorites
- Offline access to saved phrases and translations
- Mobile-responsive design

## Note

This application uses Google's Gemini API for translations. You will need an API key to use the translation functionality. Common phrases and saved translations will work without an internet connection.
*/