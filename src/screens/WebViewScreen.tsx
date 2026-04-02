import React, {useRef, useCallback, useState} from 'react';
import {StyleSheet, SafeAreaView, ActivityIndicator, View} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useAuth} from '../auth/AuthContext';
import type {Project} from '../config/projects';

interface Props {
  project: Project;
  onAuthRequired?: () => void;
}

function buildInjectionScript(access: string | null, rt: string | null): string {
  if (!access) {
    return 'true;';
  }
  const a = JSON.stringify(access);
  const r = JSON.stringify(rt || '');
  return `
    (function() {
      try {
        localStorage.setItem('oc_access_token', ${a});
        localStorage.setItem('oc_refresh_token', ${r});
        document.cookie = 'token=' + ${a} + '; path=/';
        document.cookie = 'oc_access_token=' + ${a} + '; path=/';
      } catch(e) {}
    })();
    true;
  `;
}

export function WebViewScreen({project, onAuthRequired}: Props) {
  const {accessToken, refreshToken, refresh, isAuthenticated} = useAuth();
  const webViewRef = useRef<WebView>(null);
  const isRetrying401Ref = useRef(false);
  const [webViewKey, setWebViewKey] = useState(0);

  const injectedJS = buildInjectionScript(accessToken, refreshToken);

  const handleHttpError = useCallback(
    async (syntheticEvent: {nativeEvent: {statusCode: number}}) => {
      const {statusCode} = syntheticEvent.nativeEvent;
      if (statusCode === 401 && !isRetrying401Ref.current) {
        isRetrying401Ref.current = true;
        if (!isAuthenticated) {
          // Not logged in — prompt login via drawer
          onAuthRequired?.();
          return;
        }
        const newToken = await refresh();
        if (newToken) {
          setWebViewKey(k => k + 1);
        } else {
          // Refresh failed — prompt login
          onAuthRequired?.();
        }
      }
    },
    [refresh, isAuthenticated, onAuthRequired],
  );

  const handleNavigationStateChange = useCallback(
    (_nav: WebViewNavigation) => {
      isRetrying401Ref.current = false;
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{uri: project.url}}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onHttpError={handleHttpError}
        onNavigationStateChange={handleNavigationStateChange}
        allowsBackForwardNavigationGestures={true}
        pullToRefreshEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#7A687F" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
