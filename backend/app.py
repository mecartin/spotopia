from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
import redis
import json
from typing import Optional
import sqlite3
import hashlib
from recommender import LightweightRecommender
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
import os
from dotenv import load_dotenv
import logging
import secrets
import base64
import requests
from urllib.parse import urlencode

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Spotify Credentials and Config
SPOTIFY_CLIENT_ID="5cb6d9865c444904a394a04d5dcbf123"
SPOTIFY_CLIENT_SECRET="0d451d2f35e34446a210621fe05f7d51"
SPOTIFY_REDIRECT_URI="http://127.0.0.1:8000/callback"
SPOTIFY_SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "playlist-read-private",
    "user-library-read"
]

app = FastAPI(title="Music Recommendation API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite's default dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Using Spotipy's OAuth for the /login and /callback endpoints
oauth2_scheme = SpotifyOAuth(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET,
    redirect_uri=SPOTIFY_REDIRECT_URI,
    scope=" ".join(SPOTIFY_SCOPES),
    cache_path=".spotifycache"
)

def get_current_token():
    """Get the current Spotify token from cache if valid"""
    try:
        token_info = oauth2_scheme.get_cached_token()
        if not token_info or oauth2_scheme.is_token_expired(token_info):
            return None
        return token_info["access_token"]
    except Exception as e:
        logger.error(f"Error getting token: {str(e)}")
        return None

def get_user_spotify_client(token: str = Depends(get_current_token)):
    """Get an authenticated Spotify client"""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return spotipy.Spotify(auth=token)

def get_db():
    """Get SQLite database connection"""
    try:
        conn = sqlite3.connect('songs.db')
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# Initialize Spotify client with client credentials (for non-user endpoints)
try:
    spotify = spotipy.Spotify(
        client_credentials_manager=SpotifyClientCredentials(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET
        )
    )
    # Test the connection
    spotify.search(q="test", limit=1)
    logger.info("Spotify client initialized successfully")
except Exception as e:
    logger.error(f"Spotify client initialization failed: {str(e)}")
    raise

# Initialize Redis
try:
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_client = redis.Redis(
        host=redis_host,
        port=redis_port,
        db=0,
        decode_responses=True
    )
    redis_client.ping()
    logger.info(f"Redis connection successful at {redis_host}:{redis_port}")
except redis.ConnectionError as e:
    logger.error(f"Redis connection failed: {str(e)}")
    redis_client = None

# Initialize recommender
try:
    recommender = LightweightRecommender()
    recommender.load_model('models')
    logger.info("Recommender model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load recommender model: {str(e)}")
    raise

class RecommendRequest(BaseModel):
    song_name: str
    artist_name: Optional[str] = None
    limit: Optional[int] = 10

@app.on_event("startup")
async def startup_event():
    """Initialize database and load song data on startup"""
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY,
                name TEXT,
                artists TEXT,
                year INTEGER,
                popularity REAL
            )
        ''')
        cur.execute('SELECT COUNT(*) FROM songs')
        if cur.fetchone()[0] == 0:
            song_data = recommender.song_data
            for idx, row in song_data.iterrows():
                cur.execute(
                    'INSERT INTO songs (id, name, artists, year, popularity) VALUES (?, ?, ?, ?, ?)',
                    (idx, row['name'], str(row['artists']), row['year'], row['popularity'])
                )
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

@app.get("/login")
async def login():
    """Start OAuth flow using Spotipy's OAuth"""
    try:
        auth_url = oauth2_scheme.get_authorize_url()
        logger.info("Redirecting to Spotify auth URL")
        return RedirectResponse(auth_url)
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/callback")
async def callback(code: str = None, state: str = None):
    """Handle OAuth callback from Spotify"""
    logger.debug(f"Callback received - Code: {code}, State: {state}")
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code received")
    try:
        token_info = oauth2_scheme.get_access_token(code)
        logger.info("Successfully obtained access token")
        return JSONResponse(content=token_info)
    except Exception as e:
        logger.error(f"Failed to get token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to complete authentication: {str(e)}")

@app.get("/me", description="Get current user info")
async def get_me(spotify_client: spotipy.Spotify = Depends(get_user_spotify_client)):
    """Get current user profile"""
    try:
        me = spotify_client.me()
        return me
    except Exception as e:
        logger.error(f"Failed to get user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

@app.get("/top-tracks", description="Get user's top tracks")
async def get_top_tracks(
    time_range: str = "medium_term",
    limit: int = 20,
    spotify_client: spotipy.Spotify = Depends(get_user_spotify_client)
):
    """Get user's top tracks"""
    try:
        top_tracks = spotify_client.current_user_top_tracks(limit=limit, time_range=time_range)
        return top_tracks
    except Exception as e:
        logger.error(f"Failed to get top tracks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get top tracks: {str(e)}")

def extract_spotify_features(track_id: str) -> dict:
    """Extract audio features from a Spotify track with improved error handling"""
    try:
        logger.debug(f"Requesting audio features for track ID: {track_id}")
        # Pass track_id as a list since the API expects an array of IDs
        features = spotify.audio_features([track_id])
        
        if not features or not features[0]:
            logger.error(f"No audio features returned for {track_id}")
            return get_fallback_features()
        
        # Get first element since we only requested one track
        feature_data = features[0]
        logger.debug(f"Successfully retrieved features: {feature_data}")
        
        return {
            'acousticness': feature_data['acousticness'],
            'liveness': feature_data['liveness'],
            'valence': feature_data['valence'],
            'tempo': feature_data['tempo']
        }
    except Exception as e:
        logger.error(f"Failed to extract Spotify features: {str(e)}")
        return get_fallback_features()

def get_fallback_features() -> dict:
    """Get fallback features when Spotify API fails"""
    logger.info("Using fallback features")
    return {
        'acousticness': 0.5,
        'liveness': 0.2,
        'valence': 0.5,
        'tempo': 120.0
    }

@app.get("/search")
async def search(query: str, limit: int = 50):
    """Search for songs in Spotify and local database"""
    if limit > 50:
        limit = 50
    spotify_results = spotify.search(q=query, limit=limit, type='track')
    tracks = spotify_results['tracks']['items']
    spotify_songs = [{
        'id': track['id'],
        'name': track['name'],
        'artists': [artist['name'] for artist in track['artists']],
        'year': int(track['album']['release_date'][:4]),
        'popularity': track['popularity'],
        'preview_url': track['preview_url'],
        'external_url': track['external_urls']['spotify'],
        'source': 'spotify'
    } for track in tracks]
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        SELECT * FROM songs 
        WHERE name LIKE ? OR artists LIKE ?
        ORDER BY popularity DESC
        LIMIT ?
    ''', (f'%{query}%', f'%{query}%', limit))
    local_results = [{**dict(row), 'source': 'local'} for row in cur.fetchall()]
    conn.close()
    all_results = spotify_songs + local_results
    return {"results": all_results}

@app.post("/recommend")
async def recommend(request: RecommendRequest):
    """Get music recommendations based on a song"""
    try:
        logger.info(f"Received recommendation request for song: {request.song_name}")
        query = f"track:{request.song_name}"
        if request.artist_name:
            query += f" artist:{request.artist_name}"
        
        logger.debug(f"Searching Spotify with query: {query}")
        results = spotify.search(q=query, limit=1, type='track')
        
        if not results['tracks']['items']:
            logger.warning(f"No tracks found for query: {query}")
            raise HTTPException(status_code=404, detail="Song not found on Spotify")
        
        track = results['tracks']['items'][0]
        logger.info(f"Found track: {track['name']} by {[a['name'] for a in track['artists']]}")
        
        # Try cache first if available
        cache_key = f"rec_{track['id']}_{request.limit}"
        cache_key = hashlib.md5(cache_key.encode()).hexdigest()
        
        if redis_client:
            try:
                cached = redis_client.get(cache_key)
                if cached:
                    logger.info("Returning cached recommendations")
                    return json.loads(cached)
            except redis.RedisError as e:
                logger.warning(f"Redis error: {str(e)}")
        
        # Get features using client credentials (no user token required)
        features = extract_spotify_features(track['id'])
        logger.debug(f"Extracted features: {features}")
        
        # Get recommendations from our model
        logger.debug("Requesting recommendations from model")
        recommendation_data = recommender.recommend_from_features(
            features,
            year=int(track['album']['release_date'][:4]),
            n_recommendations=request.limit
        )
        
        similar_songs = recommendation_data['song_indices']
        feature_similarities = recommendation_data['feature_similarities']
        
        # Get song details from database
        conn = get_db()
        cur = conn.cursor()
        
        placeholders = ','.join('?' * len(similar_songs))
        cur.execute(f'SELECT * FROM songs WHERE id IN ({placeholders})', similar_songs)
        
        recommendations = []
        for idx, row in enumerate(cur.fetchall()):
            song_data = dict(row)
            song_data['feature_similarities'] = feature_similarities[idx]
            recommendations.append(song_data)
        
        conn.close()
        
        # Prepare response
        result = {
            'input_song': {
                'id': track['id'],
                'name': track['name'],
                'artists': [artist['name'] for artist in track['artists']],
                'year': int(track['album']['release_date'][:4]),
                'features': features,
                'preview_url': track['preview_url'],
                'external_url': track['external_urls']['spotify']
            },
            'recommendations': recommendations
        }
        
        # Cache the result
        if redis_client:
            try:
                redis_client.setex(cache_key, 3600, json.dumps(result))
                logger.debug("Cached recommendations successfully")
            except redis.RedisError as e:
                logger.warning(f"Failed to cache results: {str(e)}")
        
        logger.info("Successfully generated recommendations")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in recommend endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/personalized-recommendations")
async def personalized_recommendations(limit: int = 10, spotify_client: spotipy.Spotify = Depends(get_user_spotify_client)):
    """Get personalized recommendations based on user's top tracks"""
    try:
        top_tracks = spotify_client.current_user_top_tracks(limit=5, time_range="medium_term")
        if not top_tracks['items']:
            raise HTTPException(status_code=404, detail="No top tracks found for this user")
        all_features = []
        for track in top_tracks['items']:
            features = extract_spotify_features(track['id'])
            all_features.append(features)
        avg_features = {
            'acousticness': sum(f['acousticness'] for f in all_features) / len(all_features),
            'liveness': sum(f['liveness'] for f in all_features) / len(all_features),
            'valence': sum(f['valence'] for f in all_features) / len(all_features),
            'tempo': sum(f['tempo'] for f in all_features) / len(all_features)
        }
        recommendation_data = recommender.recommend_from_features(avg_features, n_recommendations=limit)
        similar_songs = recommendation_data['song_indices']
        feature_similarities = recommendation_data['feature_similarities']
        conn = get_db()
        cur = conn.cursor()
        placeholders = ','.join('?' * len(similar_songs))
        cur.execute(f'SELECT * FROM songs WHERE id IN ({placeholders})', similar_songs)
        recommendations = []
        for idx, row in enumerate(cur.fetchall()):
            song_data = dict(row)
            song_data['feature_similarities'] = feature_similarities[idx]
            recommendations.append(song_data)
        conn.close()
        return {
            'based_on': [t['name'] for t in top_tracks['items']],
            'average_features': avg_features,
            'recommendations': recommendations
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get personalized recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get personalized recommendations: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )
