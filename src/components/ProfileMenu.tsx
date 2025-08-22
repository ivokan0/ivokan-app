import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Avatar from './ui/Avatar';
import { useNavigation } from '@react-navigation/native';

interface ProfileMenuProps {
  userType: 'student' | 'tutor';
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ userType }) => {
  const { profile } = useAuth();
  const navigation = useNavigation();

  const navigateToProfile = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <Avatar
        size={32}
        firstName={profile?.first_name}
        lastName={profile?.last_name}
        avatarUrl={profile?.avatar_url}
        onPress={navigateToProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
});

export default ProfileMenu;