import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const SplashScreen: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Image
        source={require('../../assets/logo_white.png')}
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;


