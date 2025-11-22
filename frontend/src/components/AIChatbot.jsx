import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Fade,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { aiAPI } from '../services/api';
import { toast } from 'react-toastify';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your StockMaster AI assistant. I can help you with inventory insights, demand forecasting, and stock recommendations. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle text-to-speech for AI responses
  const speakText = async (text, language = 'en-IN') => {
    try {
      setIsSpeaking(true);
      const response = await aiAPI.textToSpeech(text, language);
      
      // Get content type from response headers or default to audio/mpeg
      const contentType = response.headers['content-type'] || 'audio/mpeg';
      console.log('Audio content type:', contentType);
      console.log('Audio data size:', response.data.size, 'bytes');
      
      // Create blob from response data
      const audioBlob = new Blob([response.data], { type: contentType });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        // Add error handler for audio playback
        audioRef.current.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          toast.error('Unable to play audio response');
        };
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        // Attempt to play
        audioRef.current.play().catch((err) => {
          console.error('Play error:', err);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        });
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast.error('Failed to generate voice response');
    }
  };

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chat({ message: textToSend });
      const aiMessage = { role: 'assistant', content: response.data.message };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Automatically speak the AI response in the detected language
      const detectedLanguage = response.data.detectedLanguage || 'en-IN';
      await speakText(response.data.message, detectedLanguage);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Convert speech to text
        try {
          setIsLoading(true);
          const response = await aiAPI.speechToText(audioBlob);
          const transcribedText = response.data.text;
          
          if (transcribedText) {
            setInput(transcribedText);
            // Automatically send the transcribed text
            await handleSend(transcribedText);
          } else {
            toast.error('Could not transcribe audio. Please try again.');
          }
        } catch (error) {
          console.error('STT error:', error);
          toast.error('Failed to convert speech to text');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording... Click stop when done.');
    } catch (error) {
      console.error('Microphone access error:', error);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Stop audio playback
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Floating Button */}
      {!isOpen && (
        <Tooltip title="AI Assistant" placement="left">
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1300,
            }}
          >
            <IconButton
              onClick={() => setIsOpen(true)}
              sx={{
                width: 60,
                height: 60,
                backgroundColor: 'primary.main',
                color: 'white',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <AIIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Box>
        </Tooltip>
      )}

      {/* Chatbot Window */}
      <Fade in={isOpen}>
        <Card
          sx={{
            position: 'fixed',
            bottom: isMinimized ? 24 : 24,
            right: 24,
            width: isMinimized ? 300 : 380,
            height: isMinimized ? 60 : 500,
            zIndex: 1300,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'primary.main',
              color: 'white',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, backgroundColor: 'white' }}>
              <AIIcon sx={{ color: 'primary.main' }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                AI Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {isLoading ? 'Typing...' : 'Online'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              sx={{ color: 'white' }}
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          {!isMinimized && (
            <>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  backgroundColor: 'background.default',
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '80%',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor:
                          message.role === 'user'
                            ? 'primary.main'
                            : 'background.paper',
                        color: message.role === 'user' ? 'white' : 'text.primary',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Box>
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    >
                      <CircularProgress size={20} />
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || isRecording}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  
                  {/* Voice Input Button */}
                  <Tooltip title={isRecording ? 'Stop Recording' : 'Voice Input'}>
                    <IconButton
                      color={isRecording ? 'error' : 'primary'}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      sx={{
                        backgroundColor: isRecording ? 'error.main' : 'grey.200',
                        color: isRecording ? 'white' : 'text.primary',
                        '&:hover': {
                          backgroundColor: isRecording ? 'error.dark' : 'grey.300',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'action.disabledBackground',
                        },
                      }}
                    >
                      {isRecording ? <StopIcon /> : <MicIcon />}
                    </IconButton>
                  </Tooltip>

                  {/* Stop Speaking Button */}
                  {isSpeaking && (
                    <Tooltip title="Stop Speaking">
                      <IconButton
                        color="secondary"
                        onClick={stopSpeaking}
                        sx={{
                          backgroundColor: 'secondary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'secondary.dark',
                          },
                        }}
                      >
                        <VolumeUpIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Send Button */}
                  <IconButton
                    color="primary"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading || isRecording}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'action.disabledBackground',
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Card>
      </Fade>
    </>
  );
};

export default AIChatbot;

