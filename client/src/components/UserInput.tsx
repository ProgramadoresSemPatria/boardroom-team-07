import React from "react";
import { useState } from "react"; // Importa o hook useState para gerenciar o estado do input

interface UserInputProps {
  userId: string;
}

const UserInput = ({ userId }: UserInputProps) => {
  // useState cria uma variável de estado "inputValue" e uma função "setInputValue" para alterá-la
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Função chamada quando o formulário é enviado
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Evita que a página recarregue ao enviar o formulário
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          user_input: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send input to server');
      }

      setInputValue(""); // Limpa o campo de input após o envio
    } catch (error) {
      console.error('Error sending input:', error);
      alert('Failed to process your input. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para ativar o reconhecimento de voz
  const handleVoiceInput = () => {
    // Verifica se o navegador suporta reconhecimento de voz
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) { // Se não for suportado, exibe uma mensagem no console e sai da função
      console.log("❌ Your browser doesn't support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition(); // Cria uma nova instância do reconhecimento de voz
    recognition.lang = "en-US"; // Define o idioma para inglês
    recognition.start(); // Inicia a captura de áudio

    // Exibe uma mensagem no console informando que a gravação começou
    recognition.onstart = () => console.log("🎤 Recording...");

    interface SpeechRecognitionEvent extends Event {
      results: SpeechRecognitionResultList;
    }

    // Quando o reconhecimento de voz obtém um resultado
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript; // Extrai o texto reconhecido
      console.log("🗣️ You said:", transcript); // Exibe no console o que foi falado
      setInputValue(transcript); // Atualiza o input com o texto falado
    };

    // Se houver um erro durante o reconhecimento, exibe no console
    recognition.onerror = (event: any) => {
      console.log("⚠️ Error:", event.error);
    };

    recognition.onend = () => {
      console.log("🔴 Stopped recording.");
    };
  };

  return (
    <div className="w-[75%] mx-auto bg-zinc-900 rounded-lg border border-zinc-800 transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/20">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-semibold text-white">Share with Your Board</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Express your thoughts, concerns, or questions, and let your board members provide their insights. The more details you provide, the better the insights will be.
        </p>
      </div>

      {/* Formulário com input e botão de envio */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What would you like to discuss with your board today?"
            className="w-full p-4 bg-zinc-800/50 text-white placeholder-zinc-500 border border-zinc-700 rounded-lg 
                     focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none h-32
                     transition-colors duration-200"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`flex-1 bg-zinc-800 text-white py-2.5 px-6 rounded-lg border border-zinc-700
                     transition-all duration-200 hover:bg-zinc-700 hover:border-zinc-600
                     ${(isLoading || !inputValue.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : 'Get Board Insights'}
          </button>

          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`flex items-center justify-center bg-zinc-800/50 text-white py-2.5 px-6 
                     rounded-lg border border-zinc-700 transition-all duration-200 
                     hover:bg-zinc-700 hover:border-zinc-600
                     ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🎤 Voice Input
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInput; // Exporta o componente Main para ser usado em outros arquivos
