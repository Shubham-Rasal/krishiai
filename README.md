# KrishiAI: AI-Powered Farm Management Assistant

KrishiAI is a voice-first mobile application designed to empower Indian farmers with personalized agricultural guidance. Built with accessibility in mind, it prioritizes voice interactions while supporting text-based chat as a secondary interface.

## User-Centric Design

KrishiAI is specifically designed for farmers, with a focus on:
- Simple, intuitive interface
- Minimal technical complexity
- Voice-first interaction
- Support for regional languages
- Offline functionality for core features

## Core Features

### 🏠 Main Screen
- Quick access dashboard
- Important shortcuts
- Weather updates
- Crop calendar
- Recent activities

### 🗣️ Voice Mode
- Real-time AI conversations
- Powered by OpenAI with farming-specific grounding
- Supports multiple Indian languages including Kannada
- Focused on Karnataka region and rice farming
- Prevents AI hallucination through data grounding

### 💬 Chat & Analysis Mode
- Text-based interactions
- Advanced image analysis:
  - **Crop Disease Detection**: Custom ML model with 99% accuracy
  - **Pesticide Analysis**: OCR-based bottle content analysis
    - pH level detection
    - Usage quantity calculation
    - Target disease/pest identification
- Historical chat records

### ⚙️ Settings & Profile
- User profile management
- Farm details
- Language preferences
- Data synchronization options

## Knowledge Base

Our responses are enriched with data from authoritative sources:

- 📊 **Pesticide Database**
  - Chemical compositions
  - Usage guidelines
  - Safety protocols

- 📜 **Government Resources**
  - Current schemes
  - Subsidy information
  - Agricultural policies

- 🌾 **Agricultural Research**
  - Crop rotation guides
  - Best practices
  - Seasonal recommendations

## Technical Architecture

### Inference Server
- Custom model deployment
- Multi-model orchestration
- Decision-making module for query routing
- Load-balanced API endpoints

### Tech Stack

- **Frontend**
  - React Native v0.76
  - Expo SDK v52
  - TypeScript
  - Expo Router
  - React Native Paper

- **Backend & Storage**
  - Supabase
  - Local SQLite for offline capability
  - Secure data encryption

- **AI & ML**
  - OpenAI integration
  - Custom disease detection model
  - OCR processing
  - Multi-language support

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Expo CLI
- iOS Simulator or Android Emulator
- Expo Go app (for physical device testing)

### Installation

1. Clone the repository:

git clone https://github.com/yourusername/KrishiAI.git
cd KrishiAI


openai realtime api for voice
upstash for vector db
