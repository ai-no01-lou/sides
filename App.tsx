import React, {useEffect, useRef, useCallback} from 'react';
import {ActivityIndicator, Linking, View, StyleSheet} from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
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

function resolveProject(nameOrId: string): Project | null {
  return (
    PROJECTS.find(
      p =>
        p.id === nameOrId ||
        p.name.toLowerCase() === nameOrId.toLowerCase(),
    ) ?? null
  );
}

function parseDeepLink(url: string): Project | null {
  // Manual parsing to avoid Hermes URL() issues with custom schemes
  // Expected: sideprojects://open?name=dashboard
  const stripped = url.replace(/^sideprojects:\/\//, '');
  // stripped = "open?name=dashboard"
  const [path, query] = stripped.split('?');
  if (path !== 'open' || !query) {
    return null;
  }
  const params = new URLSearchParams(query);
  const name = params.get('name') || params.get('id');
  if (!name) {
    return null;
  }
  return resolveProject(name);
}

function AppNavigator() {
  const {isLoading, isAuthenticated} = useAuth();
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const pendingRef = useRef<Project | null>(null);

  const navigateToProject = useCallback((project: Project) => {
    if (navRef.current?.isReady()) {
      navRef.current.navigate('WebView', {project});
    } else {
      pendingRef.current = project;
    }
  }, []);

  // Handle deep links while app is open
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      const project = parseDeepLink(url);
      if (project && isAuthenticated) {
        navigateToProject(project);
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, navigateToProject]);

  // Handle deep link that launched the app (cold start)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    Linking.getInitialURL().then(url => {
      if (url) {
        const project = parseDeepLink(url);
        if (project) {
          navigateToProject(project);
        }
      }
    });
  }, [isAuthenticated, navigateToProject]);

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
    <NavigationContainer
      ref={navRef}
      onReady={() => {
        // Process any deep link that arrived before the navigator was ready
        if (pendingRef.current) {
          navRef.current?.navigate('WebView', {
            project: pendingRef.current,
          });
          pendingRef.current = null;
        }
      }}>
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
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppNavigator />
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
