import numpy as np
import pandas as pd
from annoy import AnnoyIndex
import pickle
from typing import List, Dict, Union
import joblib
import os
from sklearn.preprocessing import StandardScaler
import gc

class LightweightRecommender:
    def __init__(self):
        self.content_index = None
        self.metadata = None
        self.scaler = None
        self._song_data = None
        self.feature_weights = {
            'acousticness': 1.2,
            'liveness': 0.8,
            'valence': 1.5,
            'tempo': 1.0
        }
        self.base_features = list(self.feature_weights.keys())
        
    @property
    def song_data(self):
        """Lazy load song data only when needed"""
        if self._song_data is None:
            self._song_data = pd.read_csv('cleaned_data.csv')
        return self._song_data

    def build_model(self, data_path: str, model_path: str, n_trees: int = 50):
        """Build and save the model files with memory optimization"""
        print("Loading data in chunks...")
        chunk_size = 1000  # Process data in smaller chunks
        chunks = pd.read_csv(data_path, chunksize=chunk_size)
        
        all_features = []
        for chunk in chunks:
            # Extract and weight features
            feature_matrix = chunk[self.base_features].values
            weighted_features = np.zeros_like(feature_matrix)
            
            for i, feature in enumerate(self.base_features):
                weighted_features[:, i] = feature_matrix[:, i] * self.feature_weights[feature]
            
            all_features.append(weighted_features)
            
        # Combine features and scale
        feature_matrix = np.vstack(all_features)
        self.scaler = StandardScaler()
        scaled_features = self.scaler.fit_transform(feature_matrix)
        
        # Build optimized Annoy index
        print("Building Annoy index...")
        self.content_index = AnnoyIndex(len(self.base_features), 'angular')
        
        for i in range(len(scaled_features)):
            self.content_index.add_item(i, scaled_features[i])
        
        # Build with more trees for better accuracy but controlled memory
        self.content_index.build(n_trees, n_jobs=-1)  # Use all CPUs for building
        
        # Create metadata with minimal memory footprint
        print("Creating metadata...")
        chunks = pd.read_csv(data_path, chunksize=chunk_size)
        self.metadata = {}
        
        for chunk_idx, chunk in enumerate(chunks):
            start_idx = chunk_idx * chunk_size
            for i in range(len(chunk)):
                idx = start_idx + i
                self.metadata[idx] = {
                    'features': scaled_features[idx],
                    'year': int(chunk.iloc[i]['year'])
                }
        
        # Save model files
        os.makedirs(model_path, exist_ok=True)
        print("Saving model files...")
        self.content_index.save(f'{model_path}/content_light.ann')
        
        # Save metadata in chunks to reduce memory usage
        metadata_path = f'{model_path}/metadata_light.pkl'
        with open(metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f, protocol=4)
        
        joblib.dump(self.scaler, f'{model_path}/scaler.pkl')
        
        # Clear memory
        gc.collect()
        print("Model files saved successfully!")

    def load_model(self, model_path: str):
        """Load model files with memory optimization"""
        self.content_index = AnnoyIndex(len(self.base_features), 'angular')
        self.content_index.load(f'{model_path}/content_light.ann')
        
        # Load metadata
        with open(f'{model_path}/metadata_light.pkl', 'rb') as f:
            self.metadata = pickle.load(f)
            
        self.scaler = joblib.load(f'{model_path}/scaler.pkl')

    def normalize_tempo(self, tempo: float) -> float:
        """Normalize tempo to a 0-1 range"""
        min_tempo, max_tempo = 50, 200
        normalized = (tempo - min_tempo) / (max_tempo - min_tempo)
        return max(0, min(1, normalized))

    def calculate_temporal_similarity(self, year1: int, year2: int) -> float:
        """Calculate year-based similarity with exponential decay"""
        year_diff = abs(year1 - year2)
        return np.exp(-year_diff / 10)  # Exponential decay with 10-year half-life

    def recommend_from_features(self, features: Dict[str, float], year: int = None, n_recommendations: int = 10) -> Dict[str, List]:
        """Get recommendations with memory-efficient processing"""
        # Normalize and weight features
        features['tempo'] = self.normalize_tempo(features['tempo'])
        weighted_features = np.array([
            features[feature] * self.feature_weights[feature]
            for feature in self.base_features
        ]).reshape(1, -1)
        
        # Scale features
        scaled_features = self.scaler.transform(weighted_features)
        
        # Get candidates with search_k optimization
        search_k = min(n_recommendations * 50, 10000)  # Optimize search depth
        candidates, distances = self.content_index.get_nns_by_vector(
            scaled_features.flatten(),
            n_recommendations * 2,  # Get extra candidates for filtering
            include_distances=True,
            search_k=search_k
        )
        
        # Process recommendations
        recommendations = []
        feature_similarities = []
        
        for idx, distance in zip(candidates, distances):
            if idx not in self.metadata:
                continue
                
            meta = self.metadata[idx]
            similarity_score = 1 / (1 + distance)  # Convert distance to similarity
            
            # Apply temporal similarity if year is provided
            if year is not None:
                temporal_weight = self.calculate_temporal_similarity(year, meta['year'])
                similarity_score *= temporal_weight
            
            recommendations.append((idx, similarity_score))
            
            # Calculate feature similarities
            similarities = {}
            for i, feature in enumerate(self.base_features):
                feature_sim = 1 - abs(scaled_features[0, i] - meta['features'][i])
                similarities[feature] = float(feature_sim)
            
            feature_similarities.append(similarities)
            
            if len(recommendations) >= n_recommendations:
                break
        
        # Sort by similarity score
        recommendations.sort(key=lambda x: x[1], reverse=True)
        recommendations = recommendations[:n_recommendations]
        
        return {
            'song_indices': [idx for idx, _ in recommendations],
            'feature_similarities': feature_similarities[:n_recommendations]
        }

    def cleanup(self):
        """Free memory when recommender is not in use"""
        self._song_data = None
        gc.collect()

if __name__ == "__main__":
    # Initialize recommender
    recommender = LightweightRecommender()
    
    # Build and save the model
    print("Building new model...")
    recommender.build_model('cleaned_data.csv', 'models')
    
    # Test the model with sample data
    print("\nTesting model...")
    test_features = {
        'acousticness': 0.5,
        'liveness': 0.2,
        'valence': 0.6,
        'tempo': 120.0
    }
    
    results = recommender.recommend_from_features(
        test_features,
        year=2020,
        n_recommendations=5
    )
    print("\nTest recommendations:", results)