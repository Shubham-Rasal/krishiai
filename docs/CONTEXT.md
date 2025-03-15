# KrishiAI: AI-Powered Farm Management Assistant

KrishiAI is a voice-first mobile application designed to assist Indian farmers with personalized agricultural guidance. The app prioritizes accessibility through voice interactions while supporting text-based chat as a secondary interface.

## Core Features

### 1. Voice-First Interface
- Primary interaction method for accessibility
- Supports multiple Indian languages
- Voice commands for queries about crops, pests, weather, and farming practices
- Spoken responses in the user's preferred language

### 2. Chat Interface
- Text-based alternative to voice
- Smart image analysis for crop disease detection
- Chat history for reference
- Support for multiple Indian languages

### 3. Image Analysis Interface
- Clean, modern UI for image uploads
- Real-time disease detection processing
- Visual feedback during analysis
- Detailed disease information and treatment recommendations
- Pesticide label scanning and safety information

The image analysis flow consists of:
1. Image upload screen with camera/gallery options
2. Processing state with visual feedback
3. Results display with:
   - Disease identification or Pesticide information
   - Confidence score
   - Treatment recommendations
   - Prevention tips
   - Safety warnings (for pesticides)

UI Components:
- Image preview container
- Upload/capture buttons
- Processing indicator
- Results card with:
  - Disease name / Pesticide name
  - Severity level / Safety level
  - Treatment steps / Usage instructions
  - Prevention measures / Safety precautions

### 4. Personalization
- Location-based customization
- Crop-specific advice
- Farm size considerations
- Seasonal recommendations
- Local weather integration

### 5. Technical Architecture

1) Tech Stack:
Frontend: React Native with TypeScript, Expo, and Expo Router
Backend/Database: Supabase
UI Framework: React Native Paper
AI Processing: OpenAI

#### Frontend
- React Native mobile application
- Voice recognition and synthesis
- Offline capability for core features
- Local storage for user preferences

#### Backend
- Python-based API server
- OpenAI integration for natural language processing
- Custom ML models for:
  - Crop disease detection
  - Pest identification
  - Yield prediction
- Agricultural knowledge base integration

#### Data Processing
- Real-time voice/text processing
- Image analysis for crop health
- Contextual response generation
- Multi-language translation

### 6. User Flow

1. **Disease Detection**
   - Upload or capture crop image
   - View processing feedback
   - Receive disease analysis
   - Get treatment recommendations

2. **Daily Usage**
   - Voice/text queries
   - Image-based analysis
   - Personalized recommendations
   - Weather alerts

3. **Knowledge Access**
   - Government schemes
   - Best practices
   - Market prices
   - Local agricultural news

### 7. Pesticide Label Analysis

1. **Upload Flow**
   - Capture pesticide label image
   - OCR processing of text
   - AI analysis of ingredients
   - Safety classification
   - Usage recommendations

2. **Safety Information**
   - Active ingredients
   - Hazard classification
   - Required protective equipment
   - Environmental impact
   - First aid measures

3. **Usage Guidelines**
   - Proper dilution ratios
   - Application methods
   - Waiting periods
   - Storage instructions
   - Disposal guidelines

## Implementation Guidelines

1. **Accessibility First**
   - Simple, intuitive interface
   - Minimal text dependency
   - Clear audio feedback
   - Offline functionality for core features

2. **Performance**
   - Fast response times
   - Efficient data usage
   - Battery optimization
   - Robust error handling

3. **Data Security**
   - Local data encryption
   - Secure API communications
   - Privacy-focused design
   - Regular backups

4. **Scalability**
   - Modular architecture
   - Extensible ML pipeline
   - Language addition support
   - Feature flagging system

This document serves as the primary reference for KrishiAI's development team. All implementation decisions should align with these guidelines while prioritizing farmer accessibility and usefulness.

## Database Schema

### Tables

1. **users**
   ```sql
   users (
     id: uuid primary key
     created_at: timestamp with time zone
     phone_number: text unique
     preferred_language: text
     name: text
     village: text
     district: text
     state: text
   )
   ```

2. **farms**
   ```sql
   farms (
     id: uuid primary key
     user_id: uuid references users(id)
     created_at: timestamp with time zone
     size_acres: decimal
     soil_type: text
     irrigation_type: text
     location_lat: decimal
     location_long: decimal
   )
   ```

3. **crops**
   ```sql
   crops (
     id: uuid primary key
     farm_id: uuid references farms(id)
     created_at: timestamp with time zone
     crop_type: text
     planting_date: date
     expected_harvest_date: date
     status: text
   )
   ```

4. **chat_history**
   ```sql
   chat_history (
     id: uuid primary key
     user_id: uuid references users(id)
     created_at: timestamp with time zone
     message: text
     is_user_message: boolean
     message_type: text // 'text', 'voice', 'image'
     language: text
   )
   ```

5. **crop_issues**
   ```sql
   crop_issues (
     id: uuid primary key
     crop_id: uuid references crops(id)
     created_at: timestamp with time zone
     issue_type: text // 'disease', 'pest', 'deficiency'
     description: text
     status: text
     image_url: text
     ai_diagnosis: jsonb
     confidence_score: decimal
     recommended_treatment: text
     prevention_tips: text[]
   )
   ```

6. **pesticide_scans**
   ```sql
   pesticide_scans (
     id: uuid primary key
     user_id: uuid references users(id)
     created_at: timestamp with time zone
     image_url: text
     ocr_text: text
     active_ingredients: jsonb
     hazard_level: text
     safety_guidelines: text[]
     usage_instructions: text
     storage_guidelines: text
     environmental_warnings: text[]
     first_aid_measures: text[]
     ai_confidence_score: decimal
   )
   ```

## Project Structure

KrishiAI/
├── app/ # Expo Router app directory
│ ├── (auth)/ # Authentication routes
│ ├── (tabs)/ # Main tab navigation
│ │ ├── analyze.tsx # Image analysis screen
│ │ ├── pesticide-scan.tsx # Pesticide label scanning screen
│ │ ├── results.tsx # Analysis results screen
│ │ └── layout.tsx # Root layout
│ ├── modals/ # Modal screens
│ ├── components/ # Reusable components
│ │ ├── common/ # Generic components
│ │ ├── forms/ # Form components
│ │ ├── layouts/ # Layout components
│ │ ├── analysis/
│ │ │ ├── ImageUploader.tsx
│ │ │ ├── ProcessingIndicator.tsx
│ │ │ ├── ResultsCard.tsx
│ │ │ ├── TreatmentSteps.tsx
│ │ │ ├── PesticideScanResults.tsx
│ │ │ └── SafetyGuidelinesCard.tsx
│ │ └── hooks/ # Custom React hooks
│ │ ├── useAuth.ts
│ │ ├── useVoice.ts
│ │ └── useDatabase.ts
│ ├── services/ # External services
│ │ ├── ai/ # AI integration
│ │ ├── storage/ # Storage utilities
│ │ └── api/ # API clients
│ ├── utils/ # Helper functions
│ │ ├── translations/ # Language files
│ │ └── validators/ # Form validators
│ ├── constants/ # App constants
│ ├── types/ # TypeScript types
│ └── context/ # React Context
├── assets/ # Static assets
│ ├── images/
│ ├── fonts/
│ └── icons/
├── docs/ # Documentation
├── tests/ # Test files
├── app.json # Expo config
├── babel.config.js
├── tsconfig.json
└── package.json