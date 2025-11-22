const axios = require('axios');
const FormData = require('form-data');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

/**
 * Speech-to-Text using Sarvam AI
 * Converts audio to text
 */
exports.speechToText = async (audioBuffer, language = 'en-IN') => {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'saarika:v2.5');
    formData.append('language_code', language);

    const response = await axios.post(
      `${SARVAM_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'API-Subscription-Key': SARVAM_API_KEY,
        },
      }
    );

    return {
      success: true,
      text: response.data.transcript,
    };
  } catch (error) {
    console.error('Sarvam STT Error:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Failed to convert speech to text',
      error: error.message,
    };
  }
};

/**
 * Text-to-Speech using Sarvam AI
 * Converts text to audio
 */
exports.textToSpeech = async (text, language = 'en-IN', speaker = 'anushka') => {
  try {
    const response = await axios.post(
      `${SARVAM_BASE_URL}/text-to-speech`,
      {
        inputs: [text],
        target_language_code: language,
        speaker: 'anushka', // Valid Sarvam AI speaker (female voice)
        model: 'bulbul:v2', // Updated to v2 as per Sarvam API requirement
      },
      {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Log the actual content type from Sarvam
    const actualContentType = response.headers['content-type'] || 'audio/wav';
    console.log('Sarvam TTS Content-Type:', actualContentType);
    console.log('TTS Response size:', response.data.byteLength, 'bytes');

    // If Sarvam returns JSON, it might be base64 encoded audio
    if (actualContentType.includes('application/json')) {
      console.log('Sarvam returned JSON, attempting to parse...');
      const jsonData = JSON.parse(Buffer.from(response.data).toString('utf-8'));
      console.log('JSON response keys:', Object.keys(jsonData));
      
      // Check if audio is base64 encoded in the JSON
      if (jsonData.audios && jsonData.audios.length > 0) {
        const base64Audio = jsonData.audios[0];
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        console.log('Decoded audio buffer size:', audioBuffer.length, 'bytes');
        
        return {
          success: true,
          audioBuffer: audioBuffer,
          contentType: 'audio/wav',
        };
      }
    }

    return {
      success: true,
      audioBuffer: response.data,
      contentType: actualContentType.includes('json') ? 'audio/wav' : actualContentType,
    };
  } catch (error) {
    console.error('Sarvam TTS Error:', error.response?.data || error.message);
    // Try to parse the error if it's a buffer
    if (error.response?.data) {
      try {
        const errorText = Buffer.isBuffer(error.response.data) 
          ? error.response.data.toString('utf-8')
          : JSON.stringify(error.response.data);
        console.error('TTS Error Details:', errorText);
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return {
      success: false,
      message: 'Failed to convert text to speech',
      error: error.message,
    };
  }
};

/**
 * Translate text using Sarvam AI
 */
exports.translate = async (text, sourceLanguage, targetLanguage) => {
  try {
    const response = await axios.post(
      `${SARVAM_BASE_URL}/translate`,
      {
        input: text,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        speaker_gender: 'Female',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true,
      },
      {
        headers: {
          'API-Subscription-Key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      translatedText: response.data.translated_text,
    };
  } catch (error) {
    console.error('Sarvam Translation Error:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Failed to translate text',
      error: error.message,
    };
  }
};

