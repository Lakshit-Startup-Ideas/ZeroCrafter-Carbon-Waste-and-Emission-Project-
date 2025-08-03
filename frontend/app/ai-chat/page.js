'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'

export default function AIChatPage() {
  const router = useRouter()
  const [chatSessions, setChatSessions] = useState([])
  const [currentChatIndex, setCurrentChatIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadChatHistory()
    loadChatList()
  }, [])

  useEffect(() => {
    loadChatList()
  }, [chatSessions])

  const loadChatHistory = () => {
    const savedSessions = JSON.parse(localStorage.getItem('chatSessions')) || []
    setChatSessions(savedSessions)
    setCurrentChatIndex(savedSessions.length > 0 ? savedSessions.length - 1 : 0)
  }

  const loadChatList = () => {
    // This will be handled by the useEffect
  }

  const sendMessage = async () => {
    const message = userInput.trim()
    if (!message) return

    // Add user message to current chat
    const updatedSessions = [...chatSessions]
    if (!updatedSessions[currentChatIndex]) {
      updatedSessions[currentChatIndex] = []
    }
    updatedSessions[currentChatIndex].push({ message, sender: 'user' })
    setChatSessions(updatedSessions)
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions))
    setUserInput('')
    setIsLoading(true)

    try {
      // Call backend API instead of Groq directly
      const response = await api.ai.chat(message)
      const botMessage = response.data.response

      // Add bot response to current chat
      const finalSessions = [...updatedSessions]
      finalSessions[currentChatIndex].push({ message: botMessage, sender: 'bot' })
      setChatSessions(finalSessions)
      localStorage.setItem('chatSessions', JSON.stringify(finalSessions))
    } catch (error) {
      console.error('Error:', error)
      const errorSessions = [...updatedSessions]
      errorSessions[currentChatIndex].push({ 
        message: 'Error: Unable to fetch response', 
        sender: 'bot' 
      })
      setChatSessions(errorSessions)
      localStorage.setItem('chatSessions', JSON.stringify(errorSessions))
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    const newSessions = [...chatSessions, []]
    setChatSessions(newSessions)
    setCurrentChatIndex(newSessions.length - 1)
    localStorage.setItem('chatSessions', JSON.stringify(newSessions))
  }

  const loadSpecificChat = (index) => {
    setCurrentChatIndex(index)
  }

  const clearChatHistory = () => {
    localStorage.removeItem('chatSessions')
    setChatSessions([])
    setCurrentChatIndex(0)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentChat = chatSessions[currentChatIndex] || []

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-white">ZeroCraftr AI Assistant</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4">
            <button
              onClick={startNewChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </button>
            <h2 className="text-lg font-semibold mb-4">Past Chats</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chatSessions.map((session, index) => (
                <button
                  key={index}
                  onClick={() => loadSpecificChat(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentChatIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {session.length > 0 
                    ? session[0].message.substring(0, 30) + '...' 
                    : `Chat ${index + 1}`
                  }
                </button>
              ))}
            </div>
            <button
              onClick={clearChatHistory}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentChat.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <h3 className="text-xl font-semibold mb-2">Welcome to ZeroCraftr AI Assistant</h3>
                <p className="text-sm">
                  Ask me about emission tracking, sustainability, or any questions about ZeroCraftr!
                </p>
              </div>
            )}
            
            {currentChat.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    chat.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !userInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 