import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from ast import literal_eval
from sklearn.preprocessing import StandardScaler

# Read the dataset
df = pd.read_csv('data.csv')

# 1. Handle missing values
def clean_data(df):
    print("\nMissing Values Analysis:")
    print(df.isnull().sum())
    
    # Fill missing numerical values with median
    numerical_cols = ['duration_ms', 'year', 'acousticness', 'danceability', 'energy',
                     'instrumentalness', 'liveness', 'loudness', 'speechiness', 
                     'tempo', 'valence', 'mode', 'key', 'popularity']
    df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].median())
    
    # Fill missing categorical values with mode
    categorical_cols = ['name', 'explicit']
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])
    
    # Handle artists column (convert string representations to lists)
    df['artists'] = df['artists'].fillna('[]')
    df['artists'] = df['artists'].apply(lambda x: literal_eval(x) if isinstance(x, str) else x)
    
    return df

# 2. Handle outliers
def handle_outliers(df):
    print("\nOutlier Analysis:")
    
    # Handle tempo outliers
    tempo_mask = (df['tempo'] >= 50) & (df['tempo'] <= 250)
    outliers = len(df) - sum(tempo_mask)
    print(f"Found {outliers} tempo outliers")
    
    # Replace outliers with boundary values
    df.loc[df['tempo'] < 50, 'tempo'] = 50
    df.loc[df['tempo'] > 250, 'tempo'] = 250
    
    return df

def create_features(df):
    # Create era (decade) bins
    df['era'] = (df['year'] // 10) * 10
    df['era'] = df['era'].astype(str) + 's'
    
    # Calculate mean popularity per artist
    # First, explode the artists list to get one row per artist
    artist_pop = df.explode('artists')[['artists', 'popularity']]
    artist_mean_pop = artist_pop.groupby('artists')['popularity'].mean()
    
    # Map back to original dataframe (using first artist for simplicity)
    df['primary_artist'] = df['artists'].apply(lambda x: x[0] if isinstance(x, list) and len(x) > 0 else x)
    df['artist_popularity'] = df['primary_artist'].map(artist_mean_pop)
    
    # Convert duration to minutes
    df['duration_min'] = df['duration_ms'] / (1000 * 60)
    
    return df

def normalize_features(df):
    # Scale loudness to [0,1] range
    df['loudness_scaled'] = (df['loudness'] + 60) / 60
    # Clip any values outside [0,1] range due to potential outliers
    df['loudness_scaled'] = df['loudness_scaled'].clip(0, 1)
    
    # Standardize tempo
    scaler = StandardScaler()
    df['tempo_standardized'] = scaler.fit_transform(df[['tempo']])
    
    return df

def prepare_for_modeling(df):
    # One-hot encode key and mode
    key_dummies = pd.get_dummies(df['key'], prefix='key')
    mode_dummies = pd.get_dummies(df['mode'], prefix='mode')
    
    # Combine with original dataframe
    df = pd.concat([df, key_dummies, mode_dummies], axis=1)
    
    # Drop original columns
    df.drop(['key', 'mode'], axis=1, inplace=True)
    
    return df

def save_by_era(df, output_dir='processed_data'):
    # Create output directory if it doesn't exist
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # Save data by era
    for era in df['era'].unique():
        era_df = df[df['era'] == era]
        output_file = f'{output_dir}/songs_{era}.parquet'
        era_df.to_parquet(output_file, index=False)

# 3. Create visualizations
def create_visualizations(df):
    # Set a basic style that's guaranteed to work
    plt.style.use('default')
    
    # 1. Distribution plots for audio features
    audio_features = ['acousticness', 'danceability', 'energy', 'instrumentalness',
                     'liveness', 'speechiness', 'valence', 'tempo']
    
    fig, axes = plt.subplots(4, 2, figsize=(15, 20))
    axes = axes.ravel()
    
    for idx, feature in enumerate(audio_features):
        sns.histplot(data=df, x=feature, ax=axes[idx], bins=30)
        axes[idx].set_title(f'Distribution of {feature}')
        axes[idx].set_xlabel(feature.capitalize())
        axes[idx].set_ylabel('Count')
    
    plt.tight_layout()
    plt.savefig('audio_features_distribution.png')
    plt.close()
    
    # 2. Correlation matrix
    correlation_features = audio_features + ['popularity', 'loudness']
    corr_matrix = df[correlation_features].corr()
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, fmt='.2f')
    plt.title('Correlation Matrix of Audio Features')
    plt.tight_layout()
    plt.savefig('correlation_matrix.png')
    plt.close()

# Main execution
def main():
    # Read data
    df = pd.read_csv('data.csv')
    print("Initial shape:", df.shape)
    
    # Clean and transform data
    df = clean_data(df)
    df = handle_outliers(df)
    
    # Feature engineering and normalization
    print("\nCreating new features and normalizing...")
    df = create_features(df)
    df = normalize_features(df)
    df = prepare_for_modeling(df)
    
    # Create visualizations
    create_visualizations(df)
    
    # Save processed data
    print("\nSaving processed data...")
    df.to_csv('cleaned_data.csv', index=False)
    save_by_era(df)
    
    # Update EDA report
    with open('eda_report.txt', 'w') as f:
        f.write("Exploratory Data Analysis Report\n")
        f.write("================================\n\n")
        
        f.write("1. Dataset Overview\n")
        f.write(f"Total number of songs: {len(df):,}\n")
        f.write(f"Time period: {df['year'].min()} - {df['year'].max()}\n\n")
        
        f.write("2. Audio Features Summary\n")
        f.write(df[['acousticness', 'danceability', 'energy', 'instrumentalness',
                   'liveness', 'speechiness', 'tempo_standardized', 'valence']].describe().to_string())
        f.write("\n\n")
        
        f.write("3. Key Findings\n")
        f.write(f"- Average song popularity: {df['popularity'].mean():.2f}\n")
        f.write(f"- Median artist popularity: {df['artist_popularity'].median():.2f}\n")
        f.write(f"- Average duration (minutes): {df['duration_min'].mean():.2f}\n")
        f.write(f"- Most common era: {df['era'].mode().iloc[0]}\n")
        
        f.write("\n4. Visualization Summary\n")
        f.write("- Distribution plots have been saved as 'audio_features_distribution.png'\n")
        f.write("- Correlation matrix has been saved as 'correlation_matrix.png'\n")
        f.write("- Processed data saved by era in 'processed_data' directory\n")

if __name__ == "__main__":
    main()