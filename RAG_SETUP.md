# SharePlate RAG Chatbot - Setup & User Guide

SharePlate includes an in-app assistant ("SharePlate Assistant") powered by a domain-grounded **RAG (retrieval-augmented generation)** service.

The chatbot provides:
1. **Universal LLM Support**: Works with **xAI (Grok)**, **Groq**, **OpenAI**, or any **OpenAI-compatible source LLM**.
2. **Auto-Provider Detection**: Automatically detects the provider from your API key prefix (`xai-`, `gsk_`, `sk-`).
3. **Resilient Dynamic Model Fallbacks**: If a configured model is deprecated or returns 404, it automatically discovers and falls back to working models on your account.
4. **Comprehensive FAQs**: Answers questions about food donor/restaurant registration, NGO registration, posting food, claiming food, deadlines, pickup flow, reliability scores, and sustainability metrics.
5. **Live Database Integration**:
   - Queries **MongoDB** for authenticated user profiles, reliability stats, and NGO applications.
   - Queries **MySQL** for live surplus food donation posts and active claims.
6. **Website-Specific Web Scraping**: Scrapes external website URLs mentioned in user queries (or general food rescue references) using BeautifulSoup to provide grounded, website-specific answers.
7. **Frontend Chatbot UI**: Floating assistant panel with live connection status, quick question chips, source citations, markdown formatting, and error handling.

---

## Running the Application

Running the full SharePlate platform requires three services:

```
Terminal 1: Backend       -> http://localhost:5000 (Node.js + Express)
Terminal 2: RAG Service   -> http://localhost:8000 (Python + FastAPI)
Terminal 3: Frontend      -> http://localhost:5173 (React + Vite)
```

### 1. Database Prerequisites
- **MongoDB**: Running at `mongodb://127.0.0.1:27017` (database: `shareplate_db`)
- **MySQL**: Running at `localhost:3306` (database: `ecorescue_db`)

### 2. Start the Backend
```bash
cd backend
npm install
npm start
```

### 3. Start the RAG Service
```bash
cd rag-service

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python main.py
```

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Configuring the LLM in `rag-service/.env`

Edit `rag-service/.env` to configure your chosen LLM provider:

### Option A: xAI (Grok)
```env
LLM_BASE_URL=https://api.x.ai/v1
LLM_API_KEY=xai-your-api-key-here
LLM_CHAT_MODEL=grok-2-latest
```

### Option B: Groq
```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_your-api-key-here
LLM_CHAT_MODEL=openai/gpt-oss-120b
```

### Option C: OpenAI
```env
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-your-api-key-here
LLM_CHAT_MODEL=gpt-4o-mini
```

### Option D: Ollama / Local LLM
```env
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_CHAT_MODEL=llama3
```

---

## RAG Service Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Healthcheck and service status |
| `/faqs` | GET | List all structured SharePlate FAQs |
| `/stats` | GET | Retrieve live platform statistics from MongoDB & MySQL |
| `/scrape` | POST | Scrape a target website URL (`{"url": "...", "query": "..."}`) |
| `/chat` | POST | Main chat endpoint with RAG context, live DB, and web scraping |
