import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState(["hi there", "hello"]);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8081";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      setMessages(m => [...m, event.data]);
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        payload: {
          roomId: "red"
        }
      }));
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className='h-screen bg-black'>
      <br /><br /><br />

      <div className='h-[85vh]'>
        {messages.map((message, index) => (
          <div key={index} className='m-8'> 
            <span className='bg-white text-black rounded p-4'>            
              {message} 
            </span>
          </div>
        ))}
      </div>

      <div className='w-full bg-white flex'>
        <input
          ref={inputRef}
          className="flex-1 p-4"
          placeholder="Type message..."
        />

        <button
          onClick={() => {
            const message = inputRef.current?.value;

            if (!message || !wsRef.current) return;

            wsRef.current.send(JSON.stringify({
              type: "chat",
              payload: {
                message: message
              }
            }));

            if (inputRef.current) inputRef.current.value = "";
          }}
          className='bg-purple-600 text-white p-4'
        >
          Send message
        </button>
      </div>
    </div>
  )
}

export default App;
