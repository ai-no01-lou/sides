import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { WebViewScreen } from './src/screens/WebViewScreen';
import { parseDeepLink } from './src/utils/linking';

export type RootStackParamList = {
  Home: undefined;
  WebView: { url: string; title?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const handleDeepLink = (url: string | null) => {
    const { url: targetUrl } = parseDeepLink(url);
    if (targetUrl && navigationRef.current) {
      navigationRef.current.navigate('WebView', { url: targetUrl });
    }
  };

  useEffect(() => {
    // Handle deep link that launched the app
    Linking.getInitialURL().then((url) => {
      handleDeepLink(url);
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WebView" component={WebViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
