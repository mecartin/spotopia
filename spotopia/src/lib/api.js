const API_BASE_URL = 'http://localhost:8000';

/**
 * Search for songs by name or artist
 * 
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Object>} - The search results
 */
export async function searchSongs(query, limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
}

/**
 * Get recommendations based on a song
 * 
 * @param {string} songName - Name of the song
 * @param {string} artistName - Name of the artist (optional)
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Object>} - The recommendations
 */
export async function getRecommendations(songName, artistName = '', limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        song_name: songName,
        artist_name: artistName,
        limit: limit
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Recommendations failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Get personalized recommendations based on user's top tracks
 * 
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Object>} - The personalized recommendations
 */
export async function getPersonalizedRecommendations(limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/personalized-recommendations?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Personalized recommendations failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
}