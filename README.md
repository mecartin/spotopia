# Spotopia

![Spotopia Logo](./spotopia/public/logo.png)

A music recommendation app combining Spotify's API with a curated dataset of 170,000+ songs.

## Features

- **Hybrid Search**: Find tracks from both Spotify and our local dataset
- **Smart Recommendations**: Get song suggestions based on audio features like acousticness, energy, and tempo
- **Visual Experience**: All songs display with album artwork (from Spotify or algorithmically generated)
- **Retro UI**: Enjoy a nostalgic interface with pixel-art inspired design

## Album Artwork System

All songs in Spotopia display with album artwork through our multi-tier approach:

1. **Spotify API Images**: Official album covers for Spotify tracks
2. **Cross-Referenced Images**: We search Spotify for matches to our local songs
3. **Generated Artwork**: For local songs without Spotify matches, we generate unique images based on:
   - **Song name**: Determines the main color hue
   - **Artist**: Influences color saturation
   - **Release year**: Affects brightness

This ensures a consistent visual experience across all recommendations, regardless of source.

## Quick Start

```bash
./start.sh
```

This will start both the backend and frontend services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- Spotify Developer Account

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd spotopia
npm install
npm run dev
```

## How It Works

1. **Search**: Type any song or artist to search across Spotify and our local dataset
2. **Recommendations**: Our algorithm finds songs with similar audio characteristics
3. **Explore**: Browse through recommendations with album art and metadata

Presentation: https://docs.google.com/document/d/1Unt12LOnAleupRQgKVSEqS__AoO_8tYo4l1blSz6_nA/edit?usp=sharing

## Technical Stack

- **Backend**: 
  - FastAPI framework for API endpoints
  - Redis for caching recommendations
  - Spotify API integration
  - Annoy for efficient nearest-neighbor search
  
- **Frontend**: 
  - React with hooks
  - Styled Components for styling
  - React Router for navigation
  
- **Data**: 
  - 170,000+ song dataset with audio features
  - Features include: acousticness, liveness, valence, tempo, etc.
  - Temporal data spanning from 1920s to 2020s

## Image Generation Algorithm

Our image generation system for local songs:

1. Creates a deterministic hash from song metadata
2. Maps the hash to HSL color values
3. Generates a visually appealing placeholder with song and artist text
4. Uses complementary colors for optimal contrast
5. Ensures images are unique but consistent for the same songs

## License

This project is licensed under the MIT License.

## Contact

For questions or feedback, please reach out to the development team.
