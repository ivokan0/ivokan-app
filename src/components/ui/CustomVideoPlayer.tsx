import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';

interface CustomVideoPlayerProps {
  videoUrl: string;
  height?: number;
  thumbnailUrl?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ 
  videoUrl, 
  height = 200,
  thumbnailUrl 
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getVideoId(videoUrl);
  
  if (!videoId) {
    return null;
  }

  // Generate thumbnail URL if not provided
  const defaultThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const finalThumbnailUrl = thumbnailUrl || defaultThumbnailUrl;

  // Create embed URL with parameters to hide YouTube branding
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=1&fs=1&cc_load_policy=0&iv_load_policy=3&disablekb=1`;

  const handlePlay = () => {
    setIsPlaying(true);
    setWebViewKey(prev => prev + 1); // Force WebView reload to start video
  };

  const handleWebViewLoad = () => {
    // Video is loaded and ready
  };

  if (isPlaying) {
    return (
      <View style={[styles.container, { height }]}>
        <WebView
          key={webViewKey}
          source={{ uri: embedUrl }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
          onLoad={handleWebViewLoad}
          allowsInlineMediaPlayback={true}
          mediaTypes={'video'}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* Thumbnail Image */}
      <Image
        source={{ uri: finalThumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      {/* Dark overlay */}
      <View style={styles.overlay} />
      
      {/* Custom Play Button */}
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
        onPress={handlePlay}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="play"
          size={32}
          color={theme.colors.onPrimary}
        />
      </TouchableOpacity>
      
      {/* Video Duration or Title (optional) */}
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: theme.colors.onSurface }]}>
          {t('search.presentationVideo')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CustomVideoPlayer;
