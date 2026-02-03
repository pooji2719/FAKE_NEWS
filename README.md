# Fake News Detector

An AI-powered fake news detection application using Natural Language Processing. This system analyzes news articles to determine whether they are likely to be fake or real, providing detailed reasoning for each classification.

## Features

- **AI-Powered Analysis**: Uses OpenAI's GPT-4 to analyze article credibility
- **Detailed Reasoning**: Provides comprehensive explanations for each classification
- **Confidence Scores**: Shows confidence levels for each prediction
- **Analysis History**: Stores and displays past analyses
- **Beautiful UI**: Modern, responsive interface with smooth animations
- **Real-time Results**: Instant feedback on article credibility

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Edge Functions (Deno)
- **AI**: OpenAI GPT-4

## Setup Instructions

### 1. Environment Variables

The Supabase credentials are already configured in your `.env` file. However, you need to add your OpenAI API key:

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add the following secret to your Supabase project:
   - Go to your Supabase dashboard
   - Navigate to Project Settings > Edge Functions > Secrets
   - Add a new secret: `OPENAI_API_KEY` with your OpenAI API key

### 2. Database Setup

The database is already configured with:
- `news_analyses` table for storing analysis results
- Row Level Security (RLS) policies for secure access
- Proper indexes for efficient queries

### 3. Edge Function

The `analyze-news` edge function is already deployed and handles:
- Article text analysis using OpenAI
- Confidence scoring
- Detailed reasoning generation
- Database storage of results

## How It Works

1. **User Input**: Users paste a news article (minimum 50 characters) into the text area
2. **AI Analysis**: The article is sent to the edge function which uses OpenAI's GPT-4 to analyze:
   - Emotional manipulation and sensationalism
   - Source credibility
   - Logical consistency
   - Writing quality
   - Factual claims vs speculation
3. **Classification**: The AI classifies the article as:
   - **Fake**: Likely misinformation or false news
   - **Real**: Appears to be credible news
   - **Uncertain**: Not enough information to make a confident determination
4. **Results Display**: Shows the classification, confidence score, and detailed reasoning
5. **History Tracking**: All analyses are stored and can be viewed in the history section

## Usage

1. Paste a news article into the text area
2. Click "Analyze Article"
3. View the results including:
   - Classification (Fake/Real/Uncertain)
   - Confidence percentage
   - Detailed reasoning
4. Check the history section below to see past analyses

## Analysis Factors

The AI considers multiple factors when analyzing articles:

- **Sensationalism**: Overly emotional or provocative language
- **Source Citations**: Presence and credibility of sources
- **Logical Consistency**: Internal contradictions or fallacies
- **Writing Quality**: Professional journalism standards
- **Verifiable Facts**: Claims that can be fact-checked
- **Context**: Plausibility and real-world context

## Security

- All database tables use Row Level Security (RLS)
- API keys are stored securely as environment variables
- No sensitive data is exposed to the client
- Rate limiting can be implemented via IP tracking

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck
```

## Note

This tool is designed to assist in identifying potential misinformation but should not be the sole factor in determining news credibility. Always verify important information through multiple reliable sources.
