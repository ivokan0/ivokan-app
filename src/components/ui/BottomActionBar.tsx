import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BottomActionBarProps {
  onChatPress: () => void;
  onBuyTrialPress: () => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ onChatPress, onBuyTrialPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Chat Icon */}
      <TouchableOpacity
        style={[styles.chatButton, { borderColor: theme.colors.outline }]}
        onPress={onChatPress}
      >
        <MaterialCommunityIcons
          name="message-text-outline"
          size={24}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>

      {/* Buy Trial Lesson Button */}
      <TouchableOpacity
        style={[styles.buyTrialButton, { backgroundColor: theme.colors.primary }]}
        onPress={onBuyTrialPress}
      >
        <Text style={[styles.buyTrialText, { color: theme.colors.onPrimary }]}>
          {t('tutorProfile.buyTrialLesson')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24, // Extra padding for safe area
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyTrialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyTrialText: {
    fontSize: 16,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
  },
});

export default BottomActionBar;
