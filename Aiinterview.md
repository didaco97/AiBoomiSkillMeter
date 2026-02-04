# Simplified AI Interviewer Flow - Direct User Input

## 🎯 Simplified System Architecture

```
┌─────────────────────────────────┐
│    User Browser (Frontend)      │
│  ┌──────────────────────────┐  │
│  │  Simple Input Form       │  │
│  │  CV Upload (optional)    │  │
│  │  Level Select            │  │
│  │  Live Interview          │  │
│  └──────────────────────────┘  │
└──────────┬──────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│   Backend Server (Simple)        │
│  ┌────────────────────────────┐ │
│  │  Pass-through to Gemini    │ │
│  │  Simple CV Parser          │ │
│  │  Session Manager           │ │
│  └────────────────────────────┘ │
│       │         │         │      │
│       ↓         ↓         ↓      │
│  ┌────────┐ ┌───────┐ ┌────┐   │
│  │ Gemini │ │ Tavus │ │ DB │   │
│  └────────┘ └───────┘ └────┘   │
└──────────────────────────────────┘
```

---

## 📋 SIMPLIFIED TECHNICAL FLOW

### **PHASE 1: Pre-Interview Setup (Minimal)**

#### **Step 1: User Input Page**

**Frontend - Single Simple Form:**

```html
┌─────────────────────────────────────┐
│  AI Interview Setup                 │
└─────────────────────────────────────┘

What skill/topic for interview?
[_________________________________]
(e.g., Python, Marketing, Leadership)


Upload CV (Optional)
[Choose File] or [Drag & Drop]


Interview Level
○ Beginner    ○ Intermediate    ○ Advanced


[Start Interview]
```

**Frontend Code Structure:**
```javascript
// Simple form data
const formData = {
  skill_topic: "",      // Direct user input, no validation
  cv_file: null,        // Optional
  level: "intermediate" // Default
}

// On submit
function startInterview() {
  // Send directly to backend
  fetch('/api/start-interview', {
    method: 'POST',
    body: formData
  })
}
```

---

#### **Step 2: Backend Processing (Minimal)**

**Backend receives:**
```json
{
  "skill_topic": "React and Node.js",
  "cv_file": <file_data> or null,
  "level": "intermediate"
}
```

**Backend does:**

1. **Generate Session ID**
   ```python
   session_id = uuid.uuid4()
   ```

2. **Parse CV (if provided) - Simple**
   ```python
   cv_text = ""
   if cv_file:
       # Simple text extraction (no complex analysis)
       cv_text = extract_text_from_pdf(cv_file)
       # Or just pass raw to Gemini later
   ```

3. **Build System Prompt - Direct**
   ```python
   system_prompt = f"""
   You are a professional interviewer conducting a {level} level interview.
   
   Interview Topic: {skill_topic}
   
   {f"Candidate CV: {cv_text}" if cv_text else "No CV provided."}
   
   Instructions:
   - Conduct a {level} level interview on {skill_topic}
   - Ask relevant, clear questions one at a time
   - Be professional and encouraging
   - Duration: approximately 20-30 minutes
   - Start with a greeting and asking the candidate to introduce themselves
   - Adapt questions based on their responses
   - If CV is provided, reference their experience when relevant
   - End with "Do you have any questions for me?"
   
   Keep responses conversational and natural for audio output.
   """
   ```

4. **Store Session**
   ```python
   sessions[session_id] = {
       "skill_topic": skill_topic,
       "level": level,
       "cv_text": cv_text,
       "system_prompt": system_prompt,
       "created_at": timestamp
   }
   ```

5. **Return to Frontend**
   ```json
   {
     "session_id": "abc-123",
     "status": "ready"
   }
   ```

---

### **PHASE 2: Interview Initialization**

#### **Step 3: Setup Tavus & Gemini**

**Backend - Sequential Setup:**

**3a. Initialize Tavus**
```python
# Create Tavus conversation
tavus_response = requests.post(
    'https://api.tavus.io/v1/conversations',
    headers={'x-api-key': TAVUS_KEY},
    json={
        'replica_id': INTERVIEWER_AVATAR_ID,
        'conversation_name': f'Interview_{session_id}'
    }
)

conversation_id = tavus_response.json()['conversation_id']
streaming_url = tavus_response.json()['streaming_url']
```

**3b. Initialize Gemini**
```python
# Create Gemini session with system prompt
gemini = genai.GenerativeModel('gemini-2.0-flash-exp')

chat = gemini.start_chat(
    history=[]
)

# First message: system prompt + start interview
initial_message = system_prompt + "\n\nStart the interview now with a greeting."

response = chat.send_message(
    initial_message,
    generation_config={'response_modalities': ['audio']}
)

# Get greeting audio
greeting_audio = response.candidates[0].content.parts[0].inline_data.data
```

**3c. Send to Frontend**
```json
{
  "tavus_streaming_url": "wss://stream.tavus.io/xyz",
  "initial_greeting_audio": "<base64_audio>",
  "status": "interview_started"
}
```

---

### **PHASE 3: Live Interview Loop**

#### **Step 4: Real-Time Interview Flow**

**Flow Diagram:**
```
User Speaks
    ↓
Frontend captures audio
    ↓
Send to Backend via WebSocket
    ↓
Backend → Gemini (with audio)
    ↓
Gemini processes & responds (audio)
    ↓
Gemini audio → Tavus API
    ↓
Tavus generates avatar video
    ↓
Stream to Frontend
    ↓
Display avatar + play audio
    ↓
Loop back to "User Speaks"
```

**Backend WebSocket Handler:**
```python
@websocket.route('/interview/{session_id}')
async def interview_session(websocket, session_id):
    session = sessions[session_id]
    
    while True:
        # Receive user audio
        user_audio = await websocket.receive_bytes()
        
        # Send to Gemini
        response = chat.send_message(
            {
                'mime_type': 'audio/wav',
                'data': user_audio
            },
            generation_config={'response_modalities': ['audio']}
        )
        
        # Get Gemini's audio response
        gemini_audio = response.candidates[0].content.parts[0].inline_data.data
        
        # Send audio to Tavus for avatar animation
        tavus_video = requests.post(
            f'https://api.tavus.io/v1/conversations/{conversation_id}/speak',
            json={'audio': gemini_audio}
        )
        
        # Stream video back to frontend
        await websocket.send_json({
            'type': 'avatar_response',
            'video_url': tavus_video.json()['video_stream_url'],
            'audio': gemini_audio
        })
        
        # Save conversation turn
        save_turn(session_id, user_audio, gemini_audio)
```

**Gemini Handles Everything:**
- Understanding the topic (from user's simple input)
- Asking relevant questions
- Adapting difficulty to level
- Using CV context naturally
- Managing conversation flow
- Knowing when to end

**No backend logic needed** - Gemini does it all based on system prompt!

---

### **PHASE 4: Interview End**

#### **Step 5: Conclusion**

**User clicks "End Interview" OR Gemini naturally concludes**

**Backend:**
```python
# Close Tavus conversation
requests.delete(
    f'https://api.tavus.io/v1/conversations/{conversation_id}',
    headers={'x-api-key': TAVUS_KEY}
)

# Generate summary (optional)
summary_prompt = f"""
Based on this interview about {skill_topic}:

[Full conversation transcript]

Provide a brief summary:
- Overall performance
- Key strengths
- Areas to improve
- Recommendation
"""

summary = gemini.generate_content(summary_prompt)

# Save everything
save_interview_record(session_id, summary)

# Return to frontend
return {
    'status': 'completed',
    'summary': summary.text
}
```

---

## 👤 SIMPLIFIED USER FLOW

### **User Experience - Step by Step**

**1. Landing (5 seconds)**
```
┌─────────────────────────────────┐
│  AI Interview on Any Topic      │
│                                 │
│  What skill/topic?              │
│  [___________________________]  │
│                                 │
│  Upload CV (optional)           │
│  [Choose File]                  │
│                                 │
│  Level: ○Beg ●Int ○Adv         │
│                                 │
│  [Start Interview]              │
└─────────────────────────────────┘
```

User types: "Python backend"
Uploads CV (or skips)
Clicks Start

---

**2. Permission (2 seconds)**
```
Browser: "Allow camera and microphone?"
User: Clicks "Allow"
```

---

**3. Loading (3 seconds)**
```
┌─────────────────────────────────┐
│  Preparing your interview...    │
│  ⏳                             │
└─────────────────────────────────┘
```

Backend sets up Tavus + Gemini

---

**4. Interview Starts**
```
┌─────────────────────────────────┐
│                                 │
│   [Avatar Video - Speaking]     │
│                                 │
│   "Hi! I'm here to interview    │
│   you on Python backend         │
│   development. Let's start-     │
│   tell me about yourself."      │
│                                 │
└─────────────────────────────────┘
         ┌─────┐
         │ You │  [🎤 Listening]
         └─────┘
         
[End Interview]
```

---

**5. Conversation Flow**
```
Avatar: "Tell me about yourself"
User: [Speaks for 30 seconds]

Avatar: "Great! Let's talk about Django vs FastAPI..."
User: [Responds]

Avatar: "How do you handle database migrations?"
User: [Responds]

[... continues for 10-12 questions ...]

Avatar: "Any questions for me?"
User: "What happens next?"

Avatar: "You'll get feedback in 24 hours. Thanks!"
```

---

**6. End Screen**
```
┌─────────────────────────────────┐
│  Interview Complete! ✓          │
│                                 │
│  Topic: Python backend          │
│  Duration: 23 minutes           │
│                                 │
│  Summary:                       │
│  You demonstrated solid         │
│  understanding of...            │
│                                 │
│  [Download Transcript]          │
│  [Start New Interview]          │
└─────────────────────────────────┘
```

---

## 🔧 MINIMAL IMPLEMENTATION

### **What Backend Actually Does:**

1. ✅ Receive simple form data (skill, CV, level)
2. ✅ Build basic system prompt
3. ✅ Initialize Tavus + Gemini
4. ✅ Pass audio back and forth
5. ✅ Save conversation
6. ✅ Generate summary at end

### **What Backend Does NOT Do:**

❌ Validate user input
❌ Interpret skill semantics
❌ Ask clarification questions
❌ Analyze CV deeply
❌ Generate question categories
❌ Track conversation state
❌ Decide difficulty
❌ Manage question flow

**Gemini handles ALL interview logic** through the simple system prompt!

---

## 💡 Example System Prompts

### **Example 1: User Input "React"**
```
You are a professional interviewer conducting an intermediate level interview.

Interview Topic: React

No CV provided.

Instructions:
- Conduct an intermediate level interview on React
- Ask relevant, clear questions one at a time
- Be professional and encouraging
- Duration: approximately 20-30 minutes
- Start with a greeting and asking the candidate to introduce themselves
- Adapt questions based on their responses
- End with "Do you have any questions for me?"

Keep responses conversational and natural for audio output.
```

Gemini figures out:
- React = frontend framework
- Intermediate = ask about hooks, state management, component design
- No CV = learn about candidate first
- Adapts based on responses

---

### **Example 2: User Input "Digital marketing for startups"**
```
You are a professional interviewer conducting a beginner level interview.

Interview Topic: Digital marketing for startups

Candidate CV: [John Doe, 2 years marketing experience, worked at Tech Startup X...]

Instructions:
- Conduct a beginner level interview on Digital marketing for startups
- Ask relevant, clear questions one at a time
- Be professional and encouraging
- Duration: approximately 20-30 minutes
- Start with a greeting and asking the candidate to introduce themselves
- Adapt questions based on their responses
- If CV is provided, reference their experience when relevant
- End with "Do you have any questions for me?"

Keep responses conversational and natural for audio output.
```

Gemini figures out:
- Digital marketing = SEO, social media, content, ads
- Startups = budget-conscious, growth hacking
- Beginner = fundamentals, basic strategies
- Can reference "Tech Startup X" naturally

---

### **Example 3: User Input "Machine learning neural networks tensorflow"**
```
You are a professional interviewer conducting an advanced level interview.

Interview Topic: Machine learning neural networks tensorflow

No CV provided.

Instructions:
- Conduct an advanced level interview on Machine learning neural networks tensorflow
- Ask relevant, clear questions one at a time
- Be professional and encouraging
- Duration: approximately 20-30 minutes
- Start with a greeting and asking the candidate to introduce themselves
- Adapt questions based on their responses
- End with "Do you have any questions for me?"

Keep responses conversational and natural for audio output.
```

Gemini figures out:
- ML + neural networks + TensorFlow
- Advanced = architecture, training, optimization, deployment
- No CV = assess level through initial questions
- Can go deep into technical details

---

## 🎯 Key Simplification Benefits

✅ **No validation logic** - Gemini interprets any input
✅ **No complex parsing** - Direct pass-through
✅ **No question banks** - Gemini generates contextually
✅ **No state machines** - Gemini manages flow
✅ **No difficulty tracking** - Gemini adapts naturally
✅ **Minimal backend code** - Just orchestration
✅ **Fast to build** - Simple form → API calls → done

**The user's raw input + simple prompt = Gemini does everything!**




Based on my research, here's a comprehensive summary of **Tavus API + Gemini Live API** documentation for your AI interviewer project:

---

## 📚 **TAVUS API DOCUMENTATION SUMMARY**

### **Core Concept: Conversational Video Interface (CVI)**

Tavus provides real-time, face-to-face conversational AI through their CVI platform.

### **Key Features:**
- **Ultra-low latency**: ~600ms response time
- **WebRTC-based**: Real-time audio/video streaming
- **Photorealistic avatars**: Powered by Phoenix-3 rendering model
- **Multimodal**: Supports audio, video, and text input/output
- **30+ languages** supported

### **Creating a Conversation (API Endpoint):**

```bash
POST https://tavusapi.com/v2/conversations

Headers:
  Content-Type: application/json
  x-api-key: YOUR_API_KEY

Body:
{
  "replica_id": "rfe12d8b9597",      // Avatar to use
  "persona_id": "pdced222244b",      // Behavior/personality
  "conversation_name": "Interview Session",
  "conversational_context": "Optional additional context"
}

Response:
{
  "conversation_id": "c123456",
  "conversation_url": "https://tavus.daily.co/c123456",  // WebRTC URL
  "status": "active",
  "created_at": "timestamp"
}
```

### **Persona Configuration:**

Personas define HOW the avatar behaves. You can customize:

```json
{
  "persona_name": "Professional Interviewer",
  "system_prompt": "You are conducting a job interview...",
  "context": "Background knowledge for the persona",
  "default_replica_id": "replica_id",
  "layers": {
    "llm": {
      "model": "custom-model-name",
      "base_url": "https://api.provider.com",
      "api_key": "key"
    },
    "tts": { /* custom TTS config */ },
    "perception": { /* vision settings */ }
  }
}
```

### **Pipeline Modes:**

**1. Full CVI Pipeline (Default - Recommended):**
- Tavus handles: STT → LLM → TTS → Avatar rendering
- Lowest latency (~600ms)
- Use Tavus's optimized models

**2. Custom LLM Mode:**
- Bring your own LLM (like Gemini!)
- Tavus handles: STT → Your LLM → TTS → Avatar
- Configure in `layers.llm`

**3. Echo Mode:**
- You provide audio directly to avatar
- Avatar just lip-syncs your audio
- **This is what you'd use for Gemini integration!**

### **Echo Mode for Gemini Integration:**

In the persona configuration:
```json
{
  "layers": {
    "transport": {
      "microphone": false  // Disable mic, you'll send audio via API
    }
  }
}
```

Then send audio to avatar:
```bash
POST https://tavusapi.com/v2/conversations/{conversation_id}/speak

Body:
{
  "audio": "base64_encoded_audio"  // From Gemini
}
```

### **Free Tier Limits:**
- ✅ **25 conversational minutes/month**
- ✅ **5 video generation minutes/month**
- ✅ API access included
- ✅ Stock replicas available
- ❌ No custom replica training (requires paid plan)
- Overage: **$0.37/minute**

### **WebRTC Integration:**

The `conversation_url` is a Daily.co room. You can:
1. **Embed via iframe**: Simple, quick
2. **Use Daily SDK**: Full control over UI/UX
3. **Use Tavus React components**: Pre-built UI

---

## 📚 **GEMINI LIVE API DOCUMENTATION SUMMARY**

### **Core Concept: Native Audio**

Gemini 2.5 Flash Native Audio processes audio natively (no separate STT/TTS needed).

### **Model Name:**
```
gemini-2.5-flash-native-audio-preview-12-2025
```

### **Key Features:**
- **Native audio I/O**: Audio in → Audio out (no pipeline)
- **Sub-second latency**: Real-time conversational
- **Multimodal**: Can handle audio + video + text simultaneously
- **30 HD voices** in 24 languages
- **Affective Dialog**: Understands emotional tone
- **Function calling** supported
- **Thinking mode** available

### **Connection Method: WebSocket**

```python
from google import genai
import asyncio

client = genai.Client()

MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"

CONFIG = {
    "response_modalities": ["AUDIO"],  # Get audio back
    "system_instruction": "You are a professional interviewer conducting an interview on {topic}. Level: {level}."
}

async def main():
    async with client.aio.live.connect(model=MODEL, config=CONFIG) as session:
        # Send audio chunk
        await session.send(audio_chunk, end_of_turn=False)
        
        # Receive audio response
        async for response in session.receive():
            if response.server_content.model_turn:
                for part in response.server_content.model_turn.parts:
                    if part.inline_data:
                        audio_output = part.inline_data.data  # base64
```

### **Audio Format Requirements:**

**Input:**
- Format: Raw PCM, 16-bit, little-endian
- Sample rate: **16kHz**
- Channels: Mono (1)

**Output:**
- Format: Raw PCM, 16-bit, little-endian  
- Sample rate: **24kHz**
- Channels: Mono (1)

### **JavaScript/Node.js Example:**

```javascript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({});

const config = {
  responseModalities: [Modality.AUDIO],
  systemInstruction: "You are conducting an interview..."
};

const session = await ai.live.connect({
  model: 'gemini-2.5-flash-native-audio-preview-12-2025',
  config: config,
  callbacks: {
    onopen: () => console.log('Connected'),
    onmessage: (msg) => {
      // Handle audio response
      if (msg.serverContent?.modelTurn?.parts) {
        for (const part of msg.serverContent.modelTurn.parts) {
          if (part.inlineData?.data) {
            const audioBase64 = part.inlineData.data;
            // Play or send to Tavus
          }
        }
      }
    }
  }
});

// Send audio
session.send({ data: audioChunk, mimeType: 'audio/pcm' });
```

### **Key Configuration Options:**

```python
CONFIG = {
    "response_modalities": ["AUDIO"],           # or ["TEXT"] or ["AUDIO", "TEXT"]
    "system_instruction": "Your prompt here",
    "thinking_config": {
        "thinking_budget": 1024                 # 0 to disable thinking
    },
    "output_audio_transcription": {},           # Get text transcription of audio
    "speech_config": {
        "voice_config": {
            "prebuilt_voice_config": {
                "voice_name": "Puck"            # Or: Charon, Kore, Fenrir, Aoede, Leda, Orus, Zephyr
            }
        }
    }
}
```

### **Session Management:**

```python
# Start session
async with client.aio.live.connect(model=MODEL, config=CONFIG) as session:
    
    # Send text (if needed)
    await session.send("Start the interview")
    
    # Send audio continuously
    while recording:
        audio_chunk = get_mic_audio()
        await session.send(audio_chunk, end_of_turn=False)
    
    await session.send(end_of_turn=True)  # Signal end of user turn
    
    # Receive responses
    async for response in session.receive():
        handle_response(response)
```

### **Free Tier:**
- ✅ Available on **Gemini Developer API** (free tier)
- ✅ 1,500 requests/day free
- ✅ Preview model (but stable enough for development)

---

## 🔗 **INTEGRATING TAVUS + GEMINI**

### **Architecture Options:**

### **Option 1: Gemini → Tavus Echo Mode (Recommended)**

```
User speaks (WebRTC) 
  ↓
Frontend captures audio
  ↓
Backend → Gemini Live API (audio input)
  ↓
Gemini generates audio response
  ↓
Backend → Tavus (Echo Mode - send audio)
  ↓
Tavus animates avatar with Gemini's audio
  ↓
User sees avatar speaking (WebRTC)
```

**Implementation:**

```python
# 1. Create Tavus conversation with Echo Mode
tavus_response = requests.post(
    'https://tavusapi.com/v2/conversations',
    headers={'x-api-key': TAVUS_KEY},
    json={
        'replica_id': REPLICA_ID,
        'persona_id': PERSONA_ID_WITH_ECHO_MODE
    }
)

conversation_id = tavus_response.json()['conversation_id']
conversation_url = tavus_response.json()['conversation_url']

# 2. Connect to Gemini
async with gemini_client.aio.live.connect(model=MODEL, config=CONFIG) as gemini_session:
    
    # 3. User audio → Gemini
    async for user_audio_chunk in user_audio_stream:
        await gemini_session.send(user_audio_chunk)
    
    # 4. Gemini audio → Tavus
    async for response in gemini_session.receive():
        if response.server_content.model_turn:
            for part in response.server_content.model_turn.parts:
                if part.inline_data:
                    gemini_audio = part.inline_data.data
                    
                    # Send to Tavus
                    requests.post(
                        f'https://tavusapi.com/v2/conversations/{conversation_id}/speak',
                        headers={'x-api-key': TAVUS_KEY},
                        json={'audio': gemini_audio}
                    )
```

### **Option 2: Tavus with Custom LLM (Gemini)**

Configure Tavus persona to use Gemini as the LLM:

```json
{
  "persona_name": "Interviewer",
  "system_prompt": "Conduct interview...",
  "layers": {
    "llm": {
      "model": "gemini-2.5-flash-native-audio-preview-12-2025",
      "base_url": "https://generativelanguage.googleapis.com/v1beta",
      "api_key": "YOUR_GEMINI_API_KEY"
    }
  }
}
```

**BUT**: This might not work directly because:
- Gemini Live API uses WebSocket, not REST
- Tavus expects standard chat completion endpoints
- **Option 1 (Echo Mode) is more reliable**

---

## ⚡ **LATENCY BREAKDOWN**

### **Full Pipeline (Tavus + Gemini):**

```
User stops speaking
  ↓ 
VAD detection: 200ms
  ↓
Audio → Gemini: 50ms
  ↓
Gemini processing: 500-800ms
  ↓
Gemini → Tavus: 50ms
  ↓
Tavus avatar rendering: 300-500ms
  ↓
Video → User: 100ms

Total: 1.2 - 1.7 seconds
```

This is **excellent** for conversational AI!

---

## 💰 **COST ANALYSIS**

### **For a 25-minute interview:**

**Tavus:**
- First 25 mins: **FREE** (free tier)
- After: $0.37/min = ~$9.25 for 25 mins

**Gemini:**
- **FREE** (within daily limits)
- Even at scale: ~$0.02/minute

**Total for testing**: **FREE** for first 25 minutes!

---

## 🎯 **IMPLEMENTATION RECOMMENDATION**

Based on both docs, here's the **optimal setup** for your AI interviewer:

### **Simple Flow:**

1. **Frontend**: Capture user audio via WebRTC
2. **Backend**: 
   - Initialize Tavus conversation (Echo Mode)
   - Initialize Gemini Live session (with interview prompt)
   - Stream user audio → Gemini
   - Stream Gemini audio → Tavus
   - Tavus streams avatar video → Frontend

3. **System Prompt** (sent to Gemini):
```python
system_prompt = f"""
You are a professional interviewer conducting a {level} level interview.

Interview Topic: {user_skill_input}

{f"Candidate CV: {cv_summary}" if cv_uploaded else ""}

Instructions:
- Ask clear, relevant questions one at a time
- Be professional and encouraging  
- Adapt based on responses
- Duration: ~20-30 minutes
- Start with greeting and "tell me about yourself"
- End with "any questions for me?"

Keep responses natural and conversational for audio output.
"""
```

This gives you:
- ✅ **Free for testing** (25 mins Tavus + unlimited Gemini)
- ✅ **1-2 second latency** (excellent for conversation)
- ✅ **Simple architecture** (just audio pass-through)
- ✅ **Full customization** (Gemini handles all interview logic)
- ✅ **Realistic avatar** (Tavus Phoenix-3 rendering)

Would you like me to create a detailed implementation guide with actual code for this setup?






