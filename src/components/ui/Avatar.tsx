import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

interface AvatarProps {
  size?: number;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  onPress?: () => void;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  firstName,
  lastName,
  avatarUrl,
  onPress,
  style,
}) => {
  const theme = useTheme();

  // Générer les initiales
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.primary,
    },
    style,
  ];

  const textStyle = [
    styles.initials,
    {
      fontSize: size * 0.4,
      color: theme.colors.onPrimary,
    },
  ];

  const content = avatarUrl ? (
    <Image
      source={{ uri: avatarUrl }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      resizeMode="cover"
    />
  ) : (
    <View style={containerStyle}>
      <Text style={textStyle}>{getInitials()}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={style}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  image: {
    // L'image remplacera complètement le container
  },
});

export default Avatar;
