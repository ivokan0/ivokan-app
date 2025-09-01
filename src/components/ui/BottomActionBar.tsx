import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface BottomActionBarProps {
  onChatPress: () => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ onChatPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Send Message Button - Full Width */}
      <TouchableOpacity
        style={[styles.sendMessageButton, { backgroundColor: theme.colors.primary }]}
        onPress={onChatPress}
      >
        <MaterialCommunityIcons
          name="message-text-outline"
          size={24}
          color={theme.colors.onPrimary}
        />
        <Text style={[styles.sendMessageText, { color: theme.colors.onPrimary }]}>
          {t('tutorProfile.sendMessage')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    gap: 8,
  },
  sendMessageText: {
    fontSize: 16,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
  },
});

export default BottomActionBar;
