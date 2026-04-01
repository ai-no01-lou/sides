import React from 'react';
import {ActivityIndicator, View, StyleSheet, Linking} from 'react-native';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthProvider, useAuth} from './src/auth/AuthContext';
import {LoginScreen} from './src/screens/LoginScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {WebViewScreen} from './src/screens/WebViewScreen';
import {Project, PROJECTS} from './src/config/projects';

export type RootStackParamList = {
  Home: undefined;
  WebView: {project: Project};
};

const Stack = createStackNavigator<RootStackParamList>();
const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

// Handle sideprojects://open?name=X deep links
function handleDeepLink(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'open') {
      const name = parsed.searchParams.get('name') || parsed.searchParams.get('id');
      if (name) {
        const project = PROJECTS.find(
          p => p.id === name || p.name.toLowerCase() === name.toLowerCase(),
        );
        if (project && navigationRef.current?.isReady()) {
          navigationRef.current.navigate('WebView', {project});
        }
      }
    }
  } catch {}
}

function AppNavigator() {
  const {isLoading, isAuthenticated} = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {backgroundColor: '#f8f8f8'},
        headerTintColor: '#1a1a1a',
        headerTitleStyle: {fontWeight: '600'},
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="Home" options={{headerShown: false}}>
        {props => (
          <HomeScreen
            {...props}
            onProjectPress={project => {
              props.navigation.navigate('WebView', {project});
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="WebView"
        options={({route}) => ({
          title: route.params.project.name,
        })}>
        {props => <WebViewScreen project={props.route.params.project} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  React.useEffect(() => {
    // Handle deep link that opened the app
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });
    // Handle deep links while app is running
    const sub = Linking.addEventListener('url', ({url}) => handleDeepLink(url));
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
