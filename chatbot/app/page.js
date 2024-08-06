'use client'

import { useState } from "react";
import { Card, Input } from '@nextui-org/react';
import { Box, Stack, TextField, Button } from '@mui/material';

export default function Home() {

  const [messages, setMessages] = useState([{ role : 'assistant', content : 'Hello! How can I help you today?' }]);
  const [userPrompt, setUserPrompt] = useState('');

  const sendPrompt = async () => {
    
    if (userPrompt === '') return;
    
    setUserPrompt('')

    setMessages((messages) => [...messages, { role : 'user', content : userPrompt }, {role: 'assistant', content: ''}]);

    const response = await fetch('/api/chat', {
      method : 'POST',
      body : JSON.stringify([...messages, { role : 'user', content : userPrompt}]),
      headers : { 'Content-Type' : 'application/json' }
    }).then (async (res) => {

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = ''

      return reader.read().then(function processText ({done, value}) {
        if (done) return result; 

        const txt = decoder.decode(value || new Uint8Array(), {stream:true});
        setMessages( (messages) => {
          let lastMsg = messages[messages.length - 1];
          let otherMsgs = messages.slice(0, messages.length - 1);
          return [...otherMsgs, {...lastMsg, content: lastMsg.content + txt}, ]
        
        });

      return reader.read().then(processText)
      
    })
    });

  }

  return (

    <Box width={"100vw"} height={'100vh'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>

      <Stack direction={'column'} width={'500px'} maxHeight={'700px'} border={'1px solid #000'} spacing={2}>
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow={'auto'} maxHeight={'100%'}>
          {
            messages.map((message, index) => (
              <Box key={index} display={'flex'} justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
                <Box bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'} color={'white'} borderRadius={16} p={3}>
                  {message.content}
                </Box>
              </Box>
            ))
          }
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField label='Start typing here...' fullWidth value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}/>
          <Button variant={'contained'} color={'primary'} onClick={sendPrompt}>Send</Button>
        </Stack>
      </Stack>
    </Box>

  );
}
