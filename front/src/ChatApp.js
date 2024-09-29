import React, { useState, useRef, useEffect } from 'react';
import './ChatApp.css';

const ChatApp = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [journalEntries, setJournalEntries] = useState(['']);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const chatBoxRef = useRef(null);
    const [descriptions, setDescriptions] = useState(['']);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (input.trim()) {
            const userMessage = input.slice(0, 500); // Limit message length to 500 characters
            setMessages([...messages, { sender: 'user', text: userMessage }]);

            try {
                const botResponse = await getBotResponse(userMessage);
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: botResponse }]);
            } catch (error) {
                console.error('Error getting bot response:', error);
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
            }

            setInput('');
        }
    };

    const getDescriptions = async () => {
        const getTextsUrl = 'https://momento-delta.vercel.app/day';
        const reqobj = {
            date: '2024-09-28'
        }
        try {
            const response = await fetch(getTextsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqobj)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setDescriptions(response.json)
            console.log(descriptions);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // const getBotResponse = async (userInput) => {
    //     const getTextsUrl = 'https://momento-delta.vercel.app/day';
    //     const currentDate = new Date().toISOString().split('T')[0];

    //     const getChatRequest = 'https://momento-delta.vercel.app/chatrequest';

    //     try {

    //         const queryParams = new URLSearchParams(userInput).toString();

    //         try {
    //             const url = `${getChatRequest}?${queryParams}`
    //             console.log(url)
    //             const response = await fetch(url);
    //             const data = await response.json();
    //             console.log(data);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }

    //     } catch {
    //         console.error('Error:', error);
    //         throw error;     
    //     }

    //     try {
    //         // const url = `${getTextsUrl}?date=${currentDate}`
    //         // console.log(url)
    //         // const response = await fetch(url, {
    //         //     method: 'GET',
    //         //     headers: {
    //         //         'Content-Type': 'application/json',
    //         //         // Add any necessary authorization headers here
    //         //     },
    //         // });
    //         const date = {
    //             date: '2024-09-28'
    //         }
    //         const queryParams = new URLSearchParams(date).toString();

    //         try {
    //             const url = `${getTextsUrl}?${queryParams}`
    //             console.log(url)
    //             const response = await fetch(url);
    //             const data = await response.json();
    //             console.log(data);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }

    //         // if (!response.ok) {
    //         //     throw new Error(`HTTP error! status: ${response.status}`);
    //         // }

    //         // const data = await response.json();
    //         // console.log(JSON.stringify(data, null, 3));  // Pretty-print JSON response

    //         // // Process the data and return a response
    //         return `I fetched data for ${currentDate}. Here's a summary: `;
    //     } catch (error) {
    //         console.error('Error:', error);
    //         throw error;  // Re-throw the error to be caught in sendMessage
    //     }
    // };

    const getBotResponse = async (userInput) => {
        const gptApiUrl = 'https://api.openai.com/v1/chat/completions';
        //const apiKey = process.env.OPENAI_API_KEY;// Replace with your actual OpenAI API key
        const apiKey = ""
    
        const messages = [
            {
                role: "system", 
                content: "You are a helpful assistant." // Set the context of the assistant
            },
            {
                role: "user", 
                content: userInput // The user input passed into the function
            }
        ];
    
        try {
            const response = await fetch(gptApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",  // You can use 'gpt-3.5-turbo' for GPT-3.5 models
                    messages: messages,
                    max_tokens: 150 // Adjust token limit as needed
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            const botMessage = data.choices[0].message.content; // Extract the response message
    
            console.log('GPT Response:', botMessage);
            return botMessage;
        } catch (error) {
            console.error('Error calling GPT API:', error);
            throw error;
        }
    };

    const handleJournalChange = (index, value) => {
        const newEntries = [...journalEntries];
        newEntries[index] = value;
        setJournalEntries(newEntries);
    };

    const addJournalEntry = () => {
        setJournalEntries([...journalEntries, '']);
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'active' : ''}>CHAT</button>
                <button onClick={() => setActiveTab('journal')} className={activeTab === 'journal' ? 'active' : ''}>JOURNAL</button>
            </div>
            <div className="main-content">
                <h1 className="app-title">MOMENTO</h1>
                {activeTab === 'chat' ? (
                    <div className="chat-section">
                        <div className="chat-box" ref={chatBoxRef}>
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <div className="input-container">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                maxLength={500}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                ) : (
                    <div className="journal-section">
                        {journalEntries.map((entry, index) => (
                            <textarea
                                key={index}
                                className="journal-entry"
                                value={entry}
                                onChange={(e) => handleJournalChange(index, e.target.value)}
                                placeholder="journal entry"
                            />
                        ))}
                        <button className="add-entry-button" onClick={addJournalEntry}>
                            Add New Entry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatApp;