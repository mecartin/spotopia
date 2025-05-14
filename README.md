# Spotopia

Spotopia is a music recommendation application that leverages the Spotify API and a vast, curated dataset of over 170,000 songs to deliver a unique music discovery experience. It features a hybrid search, intelligent recommendations based on audio features, and a visually engaging retro-style user interface.

## Features

  * **Hybrid Search**: Enables users to find tracks from both Spotify's extensive library and Spotopia's local dataset.
  * **Smart Recommendations**: Provides song suggestions based on a variety of audio features, including acousticness, energy, liveness, valence, and tempo.
  * **Personalized Recommendations**: Users can log in with their Spotify account to receive recommendations based on their top tracks.
  * **Engaging User Interface & Experience**:
      * **Retro Aesthetic**: A nostalgic, pixel-art inspired design using the 'Press Start 2P' font and a vibrant color palette (greens, reds, blacks, and blues) to create a unique visual identity[cite: 1, 2, 3].
      * **Interactive Elements**: Buttons and inputs feature hover effects, scaling, and shadow changes to provide tactile feedback[cite: 1, 2, 3].
      * **Animations**: Subtle animations like floating logos, rotating images on hover, and progress bar animations enhance user engagement[cite: 1, 2, 3].
      * **Clear User Flow**: Intuitive navigation from the landing page through search to results.
      * **Feedback Mechanisms**: Loading spinners with custom messages and clear error messages with retry options guide the user[cite: 2, 3, 4, 5].
  * **Dynamic Album Artwork System**: Ensures all songs are displayed with album artwork, either from Spotify or algorithmically generated.

## Album Artwork System

Spotopia employs a multi-tier approach to ensure every song is accompanied by album artwork:

1.  **Spotify API Images**: Official album covers are fetched from the Spotify API for tracks available on their platform.
2.  **Cross-Referenced Images**: For songs in the local dataset, Spotopia attempts to find matching album artwork by searching on Spotify.
3.  **Generated Artwork**: If a local song doesn't have a match on Spotify, unique album artwork is algorithmically generated. The generation process uses:
      * **Song Name**: To determine the main color hue of the artwork.
      * **Artist Name**: To influence the color saturation.
      * **Release Year**: To affect the brightness of the image.
        This system guarantees a consistent and visually appealing experience across all song recommendations, irrespective of their source.

## User Interface and Experience (UI/UX)

Spotopia is designed with a focus on a fun, engaging, and retro-inspired user experience.

  * **Visual Theme**: The application consistently uses the 'Press Start 2P' font, a primary color of \#1ED760 (Spotopia green), and accent colors like \#FA0004 (retro red) and \#A0F0F2 (cyan blue) for highlights and shadows, creating a pixelated, game-like feel[cite: 1, 2, 3].
  * **Landing Page (`App.jsx`)**[cite: 1]:
      * Features an interactive central image (initially a vinyl, morphing into the Spotopia logo) that animates on hover.
      * Clicking the image reveals a "Discover" button with a distinct retro style and hover/click animations.
      * A simple footer provides copyright information.
  * **Search Page (`Search.jsx`)**[cite: 2]:
      * The Spotopia logo is prominently displayed with a subtle floating animation and rotates on hover.
      * A retro-styled search input field encourages users to "Drop your tunes here." It has focus animations (scaling, shadow change) and a shake animation if the user tries to search with an empty field.
      * The "Discover" button initiates the search and transitions the UI to a progress bar.
      * The progress bar (`retro-react` component) provides visual feedback during the search process with a striped, animated pattern[cite: 2].
      * Includes an `ErrorMessage` component for displaying search failures, offering a "Try Again" option[cite: 2, 5].
  * **Results Page (`Results.jsx`)**[cite: 3]:
      * Displays the song the recommendations are based on ("Similar To").
      * Recommended songs are shown in a series of cards, typically four at a time. Each card has a placeholder for an image, song title, artist, and year.
      * Users can navigate between sets of recommendation cards using "◀" and "▶" arrow buttons.
      * Cards have a slide-in animation and a subtle hover effect (scaling up while others scale down slightly).
      * A "Discover More" button allows users to return to the search page.
      * The Spotopia logo in the header links back to the landing page.
      * Handles loading states with a `LoadingSpinner` component, which shows a spinning retro-style border and a pixelated text message (e.g., "Finding your perfect music match...")[cite: 3, 4].
      * Error states are handled by the `ErrorMessage` component, providing context and a way to retry or navigate back[cite: 3, 5].
  * **Responsive Feedback**:
      * **Loading States**: The `LoadingSpinner.jsx` component provides visual feedback during data fetching operations, featuring a spinning border and pixelated text animation[cite: 4].
      * **Error Handling**: The `ErrorMessage.jsx` component clearly communicates errors to the user and provides actionable next steps, like a retry button[cite: 5].
      * **Interactive Elements**: Buttons generally have hover and active states (e.g., scaling, shadow changes, color changes) to indicate interactivity[cite: 1, 2, 3].

## Presentation

For a more in-depth look at the project, view the presentation:
[Spotopia Presentation](https://docs.google.com/presentation/d/12onpS748L2Xo7Vdar--UI5gBgsBI1Ket/edit?usp=sharing&ouid=111138381372127699870&rtpof=true&sd=true)

## Technical Stack

Spotopia is built with a modern and robust technical stack:

  * **Backend**:
      * **Framework**: FastAPI for creating efficient API endpoints.
      * **Database**: SQLite for storing local song metadata.
      * **Caching**: Redis is used for caching recommendations to improve performance.
      * **Spotify Integration**: Utilizes the Spotipy library for interaction with the Spotify API (OAuth for user authentication and client credentials for general API calls).
      * **Recommendation Engine**: Annoy library for efficient nearest-neighbor search in the recommendation process.
      * **Environment Management**: `python-dotenv` for managing environment variables.
  * **Frontend**:
      * **Framework**: React with Vite for a fast development experience[cite: 6].
      * **Styling**: Styled Components for dynamic and component-scoped styles, along with `retro-react` for specific UI components (like `Button`, `ProgressBar`)[cite: 1, 2, 3]. The 'Press Start 2P' font is used for the retro theme[cite: 1, 2].
      * **Routing**: React Router (`react-router-dom`) for client-side navigation between the landing page (`/`), search page (`/search`), and results page (`/results`)[cite: 7].
      * **API Communication**: Custom functions in `src/lib/api.js` handle requests to the backend[cite: 8].
      * **Utility**: `clsx` and `tailwind-merge` for conditional class names (though Tailwind CSS itself is not the primary styling method here, `tailwind-merge` can be used with `clsx`).
  * **Data**:
      * A comprehensive dataset of over 170,000 songs.
      * Audio features include acousticness, danceability, energy, instrumentalness, liveness, loudness, speechiness, tempo, valence, popularity, and mode/key.
      * Song data spans from the 1920s to the 2020s.

## How It Works

1.  **Launch & Discover**: The user starts at an interactive landing page and clicks "Discover" to proceed to the search functionality[cite: 1].
2.  **Search**: Users can type a song or artist name into the search bar. The application then queries both the Spotify API and its local dataset[cite: 2]. Inputting an empty query triggers a visual shake animation on the input field[cite: 2].
3.  **Loading**: While results are being fetched and recommendations generated, a progress bar and then a loading spinner with a message are displayed[cite: 2, 3, 4].
4.  **View Recommendations**: Based on the selected song (or user's top tracks if logged in), Spotopia's algorithm identifies and suggests songs with similar audio characteristics. These are displayed in interactive cards on the results page[cite: 3].
5.  **Explore Further**: Users can navigate through sets of recommended songs or choose to "Discover More" to perform a new search[cite: 3].
6.  **Error Handling**: If issues occur (e.g., song not found, API errors), an error message component guides the user with options to retry[cite: 5].

## Image Generation Algorithm

For songs in the local dataset that do not have corresponding artwork on Spotify, Spotopia generates unique placeholder images. This algorithm:

1.  Creates a deterministic hash from the song's metadata.
2.  Maps this hash to HSL (Hue, Saturation, Lightness) color values.
3.  Generates a visually appealing placeholder that includes the song and artist text.
4.  Utilizes complementary colors to ensure optimal contrast and readability.
5.  Ensures that the generated images are unique for different songs but consistent if the same song is displayed multiple times.

## Setup and Installation

Follow these steps to set up and run Spotopia on your local machine.

### Prerequisites

  * Python 3.11+
  * Node.js 16+
  * A Spotify Developer Account to obtain API credentials.
  * Docker and Docker Compose (optional, for containerized setup).

### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Create and activate a Python virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    Key backend dependencies include: FastAPI, Uvicorn, Redis, Annoy, NumPy, Pandas, Scikit-learn, Spotipy, python-dotenv, Joblib, and Requests.
4.  **Set up environment variables**:
    Create a `.env` file in the `backend` directory with your Spotify API credentials:
    ```env
    SPOTIFY_CLIENT_ID="YOUR_SPOTIFY_CLIENT_ID"
    SPOTIFY_CLIENT_SECRET="YOUR_SPOTIFY_CLIENT_SECRET"
    SPOTIFY_REDIRECT_URI="http://127.0.0.1:8000/callback" # Or your configured redirect URI
    REDIS_HOST="localhost" # Or your Redis host if not using Docker
    REDIS_PORT=6379       # Or your Redis port
    ```
    If using the provided `docker-compose.yml`, these can be set there as well.
5.  **Prepare Data and Model**:
      * Ensure `cleaned_data.csv` is present in the `backend` directory. This file is generated by `data_analysis.py`.
      * The recommendation model files (`content_light.ann`, `metadata_light.pkl`, `scaler.pkl`) should be in the `backend/models` directory. These are built by `recommender.py`.
6.  **Initialize the database (on first run)**:
    The FastAPI application will create and populate the `songs.db` SQLite database on startup if it doesn't exist.
7.  **Run the backend server**:
    ```bash
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
    ```

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd spotopia 
    ```
    (Note: This is the `spotopia/spotopia` directory from the root of the project).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
    Key frontend dependencies include: React, React DOM, React Router DOM, Styled Components, Lucide React, Retro React, clsx, and tailwind-merge[cite: 9].
3.  **Run the frontend development server**:
    ```bash
    npm run dev
    ```

### Docker Compose Setup (Alternative)

If you have Docker and Docker Compose installed, you can run the backend services using:

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Update the environment variables in `docker-compose.yml` if necessary, particularly `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
3.  Start the backend services (FastAPI app and Redis):
    ```bash
    docker-compose up -d
    ```

The frontend still needs to be run separately as per the "Frontend Setup" instructions. The `start.sh` script attempts to manage both Docker and manual setups.

## Quick Start

A shell script is provided to streamline the startup process. It attempts to use Docker Compose for the backend if available, otherwise, it runs services manually.

```bash
./start.sh
```

This script will:

  * Attempt to start the backend (either via Docker Compose or Uvicorn directly).
  * Attempt to start the frontend React development server.

Once started:

  * Frontend will be accessible at: `http://localhost:5173`
  * Backend API will be accessible at: `http://localhost:8000`

## API Endpoints

The backend provides several API endpoints managed by FastAPI. Key endpoints include:

  * `GET /login`: Initiates the Spotify OAuth authentication flow.
  * `GET /callback`: Handles the OAuth callback from Spotify after user authentication.
  * `GET /me`: Retrieves the current authenticated user's Spotify profile. (Requires authentication)
  * `GET /top-tracks`: Fetches the current authenticated user's top tracks from Spotify. (Requires authentication)
  * `GET /search?query=<query_string>&limit=<limit>`: Searches for songs in both Spotify and the local database.
      * Example: `/search?query=Wonderwall&limit=5`
  * `POST /recommend`: Gets music recommendations based on a specified song and artist.
      * Request Body: `{ "song_name": "string", "artist_name": "string" (optional), "limit": int (optional, default 10) }`
  * `GET /personalized-recommendations?limit=<limit>`: Gets personalized recommendations based on the authenticated user's top tracks. (Requires authentication)

## Data Analysis and Preparation

The project includes a data analysis pipeline (`backend/data_analysis.py`) responsible for:

  * **Data Cleaning**: Handling missing values in the raw song data (`data.csv`). Numerical NaNs are filled with medians, categorical NaNs with mode.
  * **Outlier Handling**: Managing outliers, for example, by capping tempo values within a reasonable range (50-250 BPM).
  * **Feature Engineering**:
      * Creating an 'era' feature by binning songs into decades (e.g., "1960s").
      * Calculating mean popularity per artist.
      * Converting duration from milliseconds to minutes.
  * **Feature Normalization/Scaling**:
      * Scaling loudness to a [0,1] range.
      * Standardizing tempo using `StandardScaler`.
  * **Data Output**: Saving the processed data as `cleaned_data.csv` and also by era into Parquet files in the `processed_data` directory.
  * **EDA Report Generation**: An `eda_report.txt` is generated summarizing key statistics and findings from the dataset.
      * The dataset contains 169,909 songs spanning from 1921 to 2020.
      * Average song popularity is approximately 31.56.

## Recommendation System

The core of Spotopia's recommendation logic resides in `backend/recommender.py`, which implements a `LightweightRecommender`.

  * **Model Building (`build_model`)**:
      * Reads song data from `cleaned_data.csv`.
      * Extracts and weights specific audio features: `acousticness`, `liveness`, `valence`, and `tempo`, with defined weights to prioritize certain characteristics.
      * Scales these features using `StandardScaler`.
      * Builds an Annoy index (`content_light.ann`) for efficient similarity search using an angular distance metric and a specified number of trees (e.g., 50).
      * Saves metadata (`metadata_light.pkl`) containing features and release years for each song, and the scaler (`scaler.pkl`).
  * **Recommendation Generation (`recommend_from_features`)**:
      * Takes input audio features (acousticness, liveness, valence, tempo) and optionally a release year.
      * Normalizes and weights the input features similar to the model building process.
      * Uses the Annoy index to find the `n` most similar songs.
      * Incorporates temporal similarity: if an input year is provided, it calculates a similarity score based on the year difference, applying an exponential decay. This gives preference to songs from a similar era.
      * Returns a list of recommended song indices and their feature similarities.
  * **Performance Metrics**:
      * The system's performance has been evaluated. For instance, the lightweight recommender (focused on 4 features and 50 trees) achieved:
          * `precision@10`: 0.3761
          * `coverage`: 0.0569
      * A more comprehensive model (details not fully specified but implied from `recommendation_metrics.txt`) showed:
          * `precision@10`: 0.2507
          * `coverage`: 0.9692

## Directory Structure (Simplified)

```
spotopia/
├── backend/
│   ├── app.py                # FastAPI application
│   ├── recommender.py        # Recommendation logic
│   ├── data_analysis.py      # Script for cleaning and preparing data
│   ├── Dockerfile
│   ├── docker-compose.yml    # Docker Compose configuration for backend services
│   ├── requirements.txt      # Python dependencies
│   ├── songs.db              # SQLite database (created at runtime)
│   ├── data.csv              # Raw song data (input for data_analysis.py)
│   ├── cleaned_data.csv      # Processed song data
│   ├── models/               # Stores the Annoy index, metadata, and scaler
│   │   ├── content_light.ann
│   │   ├── metadata_light.pkl
│   │   └── scaler.pkl
│   ├── eda_report.txt        # Exploratory Data Analysis summary
│   ├── recommendation_metrics.txt # Performance metrics
│   └── lightweight_metrics.txt  # Performance metrics for lightweight model
├── spotopia/                 # Frontend React application
│   ├── public/
│   │   └── logo.png          # Application logo
│   ├── src/
│   │   ├── App.jsx           # Main application component (landing page)
│   │   ├── Search.jsx        # Search page component
│   │   ├── Results.jsx       # Results page component
│   │   ├── main.jsx          # Entry point for the React app, sets up routing
│   │   ├── lib/
│   │   │   ├── api.js        # Functions for backend API calls
│   │   │   └── utils.js      # Utility functions
│   │   ├── components/
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json          # Frontend dependencies and scripts
│   ├── vite.config.js        # Vite configuration
│   └── README.md             # Frontend specific README
├── .gitignore
├── README.md                 # Main project README (this file)
└── start.sh                  # Script to start backend and frontend
```

## License

This project is licensed under the MIT License.

## Contact

For questions, feedback, or if you'd like to contribute, please reach out to the development team.
