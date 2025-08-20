import React, { useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { setLanguage } from '../translations/i18n';

const { width } = Dimensions.get('window');

const WelcomeScreen: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);
  const slides = useMemo(
    () => [
      {
        key: 's1',
        title: t('welcome.slides.0.title'),
        image: require('../../assets/Slide 1.jpg'),
      },
      {
        key: 's2',
        title: t('welcome.slides.1.title'),
        image: require('../../assets/Slide 2.jpg'),
      },
      {
        key: 's3',
        title: t('welcome.slides.2.title'),
        image: require('../../assets/Slide 3.jpg'),
      },
    ],
    [t],
  );

  const handleDone = async () => {
    onDone?.();
  };

  const handleSignIn = async () => {
    navigation.navigate('Auth');
  };

  const toggleLanguage = async () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    await setLanguage(next as 'en' | 'fr');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo-orange.png')} style={styles.brand} />
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton} accessibilityRole="button">
          <Text style={styles.langText}>{i18n.language === 'fr' ? 'Français' : 'English'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={slides}
        keyExtractor={(i) => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}> 
            <View style={[styles.imageBox, { width: width * 0.8 }]}>
              <Image source={item.image} style={styles.image} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <AppButton label={t('welcome.getStarted')} onPress={handleDone} style={styles.fullWidthButton} />
      <AppButton label={t('auth.login.signIn')} onPress={handleSignIn} mode="text" style={styles.signInButtonFull} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingBottom: 16, alignItems: 'center' },
  header: { width: '100%', paddingHorizontal: 16, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { width: 96, height: 28, resizeMode: 'contain' },
  langButton: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.06)' },
  langText: { fontSize: 12, fontWeight: '600' },
  slide: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  imageBox: { aspectRatio: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 12, marginBottom: 28, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  title: { fontSize: 32, fontWeight: 'bold', marginTop: 24, marginBottom: 6, textAlign: 'center', paddingHorizontal: 16, lineHeight: 40, fontFamily: 'Baloo2_600SemiBold' },
  dots: { flexDirection: 'row', marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: 'rgba(0,0,0,0.12)' },
  dotActive: { backgroundColor: 'rgba(0,0,0,0.6)' },
  fullWidthButton: { width: width * 0.8, alignSelf: 'center' },
  signInButton: { marginTop: 8 },
  signInButtonFull: { width: width * 0.8, alignSelf: 'center', marginTop: 8 },
});

export default WelcomeScreen;


