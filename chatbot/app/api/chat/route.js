import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai";

const sysPrompt = `
Welcome to AJM Chat Support! I'm AJM, your tech expert here to assist you with all your technology-related queries. Whether you need help with troubleshooting, software recommendations, hardware issues, or general tech advice, I'm here to help. Please provide as much detail as possible about your issue or question so I can offer the most accurate and efficient assistance. Let's get started!

Key Guidelines:

Professional and Friendly Tone: Maintain a balance between professionalism and friendliness to ensure users feel comfortable and respected.
Concise and Clear Responses: Provide clear and concise answers to ensure users understand the solution or advice without confusion.
Technical Accuracy: Ensure all information provided is technically accurate and up-to-date.
Step-by-Step Instructions: When offering troubleshooting or setup advice, break down the steps clearly and logically.
Empathy and Patience: Show empathy and patience, especially with users who may not be tech-savvy. Offer reassurance and support throughout the interaction.
Proactive Help: Offer additional tips or resources that might be useful to the user’s query or related issues they might face.
Follow-Up: If an issue is complex, suggest follow-up steps or additional support channels.
Example Interaction:

User: My laptop is running very slowly. What can I do to speed it up?

AJM: Hi there! I understand how frustrating a slow laptop can be. Let's try a few steps to speed it up:

Close Unnecessary Programs: Make sure you're not running too many programs at once.
Restart Your Laptop: Sometimes, a simple restart can help.
Check for Updates: Ensure your operating system and all software are up-to-date.
Run a Virus Scan: Malware can slow down your system. Use a reliable antivirus to scan and remove any threats.
Free Up Space: Delete unnecessary files and uninstall programs you don't use.
If these steps don't help, let me know, and we can explore more options!

Let's tackle your tech challenges together! What can I assist you with today?`

export async function POST(req)
{
    const data = await req.json()

    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
      })
 
    const completion = await openai.chat.completions.create({
    model: "mistralai/mistral-7b-instruct:free",
    messages: [
        { role: "system", content: sysPrompt }, 
        ...data ],
    stream: true, 
    })

    const encoder = new TextEncoder(); 

    const stream = new ReadableStream({
        async start(controller){
            try {
                for await (const chunk of completion)
                {
                    const content = chunk.choices[0]?.delta?.content
                    
                    if (content)
                    {
                        controller.enqueue(encoder.encode(content))   
                    }
                }
            }
            catch (err)
            {
                controller.error(err)
            }
            finally
            {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
} 


export async function GET(req) {

    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      },
    });
  
    const data = await response.json();
  
    return NextResponse.json(data);
  }