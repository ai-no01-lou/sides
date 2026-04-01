import React, {useRef, useCallback, useState} from 'react';
import {StyleSheet, SafeAreaView, ActivityIndicator, View} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useAuth} from '../auth/AuthContext';
import type {Project} from '../config/projects';

interface Props {
  project: Project;
}

function buildInjectionScript(access: string, rt: string): string {
  const a = JSON.stringify(access);
  const r = JSON.stringify(rt);
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

export function WebViewScreen({project}: Props) {
  const {accessToken, refreshToken, refresh} = useAuth();
  const webViewRef = useRef<WebView>(null);
  const isRetrying401Ref = useRef(false);
  // Counter to force WebView remount after 401 refresh (ensures fresh injectedJS)
  const [webViewKey, setWebViewKey] = useState(0);

  const injectedJS = buildInjectionScript(accessToken || '', refreshToken || '');

  const handleHttpError = useCallback(
    async (syntheticEvent: {nativeEvent: {statusCode: number}}) => {
      const {statusCode} = syntheticEvent.nativeEvent;
      if (statusCode === 401 && !isRetrying401Ref.current) {
        isRetrying401Ref.current = true;
        const newToken = await refresh();
        if (newToken) {
          // Remount WebView so injectedJavaScriptBeforeContentLoaded picks up the new tokens
          setWebViewKey(k => k + 1);
        }
      }
    },
    [refresh],
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
            <ActivityIndicator size="large" color="#667eea" />
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
