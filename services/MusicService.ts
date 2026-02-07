import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface MoodBasedMusic {
  mood: 'motivated' | 'tired' | 'stressed' | 'energetic' | 'calm' | 'sad';
  tracks: MusicTrack[];
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  mood: string[];
  url?: string;
  localUri?: string;
  duration: number;
}

// Mock music database - in a real app this would come from Spotify/Apple Music API
const MUSIC_DATABASE: MusicTrack[] = [
  {
    id: '1',
    title: 'Eye of the Tiger',
    artist: 'Survivor',
    genre: 'Rock',
    bpm: 109,
    mood: ['motivated', 'energetic'],
    duration: 246,
  },
  {
    id: '2',
    title: 'Pump It',
    artist: 'Black Eyed Peas',
    genre: 'Hip Hop',
    bpm: 126,
    mood: ['energetic', 'motivated'],
    duration: 215,
  },
  {
    id: '3',
    title: 'Thunder',
    artist: 'Imagine Dragons',
    genre: 'Pop Rock',
    bpm: 168,
    mood: ['motivated', 'energetic'],
    duration: 187,
  },
  {
    id: '4',
    title: 'Titanium',
    artist: 'David Guetta ft. Sia',
    genre: 'Electronic',
    bpm: 126,
    mood: ['motivated', 'energetic'],
    duration: 245,
  },
  {
    id: '5',
    title: 'Weightless',
    artist: 'Marconi Union',
    genre: 'Ambient',
    bpm: 60,
    mood: ['calm', 'stressed'],
    duration: 485,
  },
  {
    id: '6',
    title: 'Claire de Lune',
    artist: 'Claude Debussy',
    genre: 'Classical',
    bpm: 66,
    mood: ['calm', 'sad'],
    duration: 302,
  },
  {
    id: '7',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    genre: 'Funk',
    bpm: 115,
    mood: ['energetic', 'motivated'],
    duration: 270,
  },
  {
    id: '8',
    title: 'Stronger',
    artist: 'Kelly Clarkson',
    genre: 'Pop',
    bpm: 96,
    mood: ['motivated', 'sad'],
    duration: 222,
  },
];

class MusicService {
  private currentSound: Audio.Sound | null = null;
  private currentPlaylist: MusicTrack[] = [];
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  getMusicForMood(mood: string, workoutType?: string): MusicTrack[] {
    let filtered = MUSIC_DATABASE.filter(track => track.mood.includes(mood));
    
    // Filter by workout type if provided
    if (workoutType) {
      switch (workoutType) {
        case 'cardio':
          filtered = filtered.filter(track => track.bpm > 120);
          break;
        case 'strength':
          filtered = filtered.filter(track => track.bpm > 100 && track.bpm < 140);
          break;
        case 'yoga':
        case 'flexibility':
          filtered = filtered.filter(track => track.bpm < 100);
          break;
        default:
          break;
      }
    }
    
    return this.shuffleArray(filtered);
  }

  async playMoodBasedPlaylist(mood: string, workoutType?: string) {
    try {
      const playlist = this.getMusicForMood(mood, workoutType);
      if (playlist.length === 0) {
        console.warn(`No music found for mood: ${mood}`);
        return;
      }

      this.currentPlaylist = playlist;
      this.currentTrackIndex = 0;
      await this.playCurrentTrack();
    } catch (error) {
      console.error('Error playing mood-based playlist:', error);
    }
  }

  async detectMoodFromHeartRate(heartRate: number): Promise<string> {
    // Simple mood detection based on heart rate
    // In a real app, this would be more sophisticated
    if (heartRate < 60) {
      return 'tired';
    } else if (heartRate >= 60 && heartRate < 80) {
      return 'calm';
    } else if (heartRate >= 80 && heartRate < 100) {
      return 'motivated';
    } else if (heartRate >= 100 && heartRate < 140) {
      return 'energetic';
    } else {
      return 'stressed';
    }
  }

  async adaptMusicToHeartRate(heartRate: number, workoutType?: string) {
    try {
      const mood = await this.detectMoodFromHeartRate(heartRate);
      
      // If mood changed significantly, change playlist
      if (this.shouldChangeMood(mood)) {
        await this.playMoodBasedPlaylist(mood, workoutType);
      }
    } catch (error) {
      console.error('Error adapting music to heart rate:', error);
    }
  }

  private shouldChangeMood(newMood: string): boolean {
    if (this.currentPlaylist.length === 0) return true;
    
    const currentMoods = this.currentPlaylist[0]?.mood || [];
    return !currentMoods.includes(newMood);
  }

  private async playCurrentTrack() {
    try {
      await this.stop();
      
      if (this.currentTrackIndex >= this.currentPlaylist.length) {
        return;
      }

      const track = this.currentPlaylist[this.currentTrackIndex];
      
      // For demo purposes, we'll use a silence audio file
      // In a real app, you would stream from Spotify, Apple Music, or local files
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.generateSilenceUri(track.duration) },
        { shouldPlay: true, isLooping: false }
      );

      this.currentSound = sound;
      this.isPlaying = true;

      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.playNext();
        }
      });

      console.log(`Now playing: ${track.title} by ${track.artist}`);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  async playNext() {
    if (this.currentTrackIndex < this.currentPlaylist.length - 1) {
      this.currentTrackIndex++;
      await this.playCurrentTrack();
    } else {
      // Playlist ended, shuffle and restart
      this.currentPlaylist = this.shuffleArray(this.currentPlaylist);
      this.currentTrackIndex = 0;
      await this.playCurrentTrack();
    }
  }

  async playPrevious() {
    if (this.currentTrackIndex > 0) {
      this.currentTrackIndex--;
      await this.playCurrentTrack();
    }
  }

  async pause() {
    if (this.currentSound) {
      await this.currentSound.pauseAsync();
      this.isPlaying = false;
    }
  }

  async resume() {
    if (this.currentSound) {
      await this.currentSound.playAsync();
      this.isPlaying = true;
    }
  }

  async stop() {
    if (this.currentSound) {
      await this.currentSound.stopAsync();
      await this.currentSound.unloadAsync();
      this.currentSound = null;
      this.isPlaying = false;
    }
  }

  getCurrentTrack(): MusicTrack | null {
    if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.currentPlaylist.length) {
      return this.currentPlaylist[this.currentTrackIndex];
    }
    return null;
  }

  getPlaylist(): MusicTrack[] {
    return [...this.currentPlaylist];
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateSilenceUri(durationSeconds: number): string {
    // Generate a data URI for silence - for demo purposes
    // In a real app, you would use actual music streaming URLs
    return `data:audio/mp3;base64,SUQzAwAAAAABEAAAAAAAAAAAAAAA`;
  }

  // Workout-specific playlists
  async getWorkoutPlaylist(workoutType: string): Promise<MusicTrack[]> {
    switch (workoutType) {
      case 'cardio':
      case 'hiit':
        return this.getMusicForMood('energetic', workoutType);
      case 'strength':
      case 'weightlifting':
        return this.getMusicForMood('motivated', workoutType);
      case 'yoga':
      case 'pilates':
        return this.getMusicForMood('calm', workoutType);
      case 'sports':
        return this.getMusicForMood('energetic', workoutType);
      default:
        return this.getMusicForMood('motivated');
    }
  }

  // Get music recommendations based on time of day
  getTimeBasedRecommendations(): MusicTrack[] {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 10) {
      // Morning energy
      return this.getMusicForMood('energetic');
    } else if (hour >= 10 && hour < 15) {
      // Midday motivation
      return this.getMusicForMood('motivated');
    } else if (hour >= 15 && hour < 19) {
      // Afternoon energy
      return this.getMusicForMood('energetic');
    } else {
      // Evening calm
      return this.getMusicForMood('calm');
    }
  }
}

export const musicService = new MusicService();