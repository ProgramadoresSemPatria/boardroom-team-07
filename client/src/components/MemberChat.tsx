import { useState, useEffect } from 'react'
import { Chat } from '@/components/ui/chat'

interface MemberChatProps {
  member: {
    id: string
    name: string
    avatar?: string
  }
  isOpen: boolean
  onClose: () => void
}

export const MemberChat = ({ member, isOpen, onClose }: MemberChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensagem inicial com atraso para simular digitação
      setIsTyping(true)
      setTimeout(() => {
        setMessages([{
          id: '1',
          sender: member.name,
          text: `Hi there! I'm ${member.name}. What would you like to discuss?`,
          timestamp: new Date(),
          isCurrentUser: false
        }])
        setIsTyping(false)
      }, 1500)
    }
  }, [isOpen])

  const handleSendMessage = (text: string) => {
    // Mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text,
      timestamp: new Date(),
      isCurrentUser: true
    }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Simular resposta após 1-3s
    setTimeout(() => {
      const reply: Message = {
        id: Date.now().toString() + '-reply',
        sender: member.name,
        text: generateResponse(text, member.name),
        timestamp: new Date(),
        isCurrentUser: false
      }
      setMessages(prev => [...prev, reply])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const generateResponse = (input: string, memberName: string): string => {
    const responses: Record<string, string[]> = {
      "Comor Walsh": [
        `As a battle-tested CEO, here's my take: ${input} requires bold moves.`,
        `${input}? That's a common challenge. The solution lies in three steps...`,
        `*adjusts tie* Let me be frank about ${input}...`
      ],
      "Susan Fowler": [
        `From a cultural perspective, ${input} raises interesting questions.`,
        `Have you considered the team impact of ${input}?`,
        `My research suggests a nuanced approach to ${input}.`
      ],
      "Gwen Hester": [
        `Technically speaking, ${input} presents these opportunities...`,
        `Let me break down the engineering perspective on ${input}.`,
        `For ${input}, I'd recommend this technical approach first.`
      ]
    }

    return responses[memberName]?.[Math.floor(Math.random() * responses[memberName].length)] || 
           `Interesting point about ${input}. Let me think...`
  }

  if (!isOpen) return null

  return (
    <Chat
      title={member.name}
      messages={isTyping 
        ? [...messages, {
            id: 'typing',
            sender: member.name,
            text: '...',
            timestamp: new Date(),
            isCurrentUser: false
          }]
        : messages
      }
      onSendMessage={handleSendMessage}
      onClose={onClose}
    />
  )
}

type Message = {
  id: string
  sender: string
  text: string
  timestamp: Date
  isCurrentUser?: boolean
}