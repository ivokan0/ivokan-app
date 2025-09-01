import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';

interface WebViewScreenProps {
  route: {
    params: {
      url: string;
      title: string;
    };
  };
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { url, title } = route.params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
