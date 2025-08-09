import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/ui/AppButton';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const WelcomeScreen: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const slides = useMemo(
    () => [
      { key: 's1', title: 'Welcome', desc: 'Thanks for installing our app.' },
      { key: 's2', title: 'Fast', desc: 'Fast and reliable.' },
      { key: 's3', title: 'Secure', desc: 'Your data is safe with us.' },
    ],
    [],
  );

  const handleDone = async () => {
    onDone?.();
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <AppButton label={'Get Started'} onPress={handleDone} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slide: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 16, opacity: 0.8 },
  dots: { flexDirection: 'row', marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#111' },
});

export default WelcomeScreen;


