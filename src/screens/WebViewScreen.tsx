import React, {useRef, useCallback, useState} from 'react';
import {StyleSheet, SafeAreaView, ActivityIndicator, View} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useAuth} from '../auth/AuthContext';
import type {Project} from '../config/projects';

interface Props {
  project: Project;
}

export function WebViewScreen({project}: Props) {
  const {accessToken, refreshToken, refresh} = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [isRetrying401, setIsRetrying401] = useState(false);

  // Inject tokens into localStorage + cookies before the page JS runs
  const injectedJS = `
    (function() {
      try {
        localStorage.setItem('oc_access_token', ${JSON.stringify(accessToken || '')});
        localStorage.setItem('oc_refresh_token', ${JSON.stringify(refreshToken || '')});
        document.cookie = 'token=' + ${JSON.stringify(accessToken || '')} + '; path=/';
        document.cookie = 'oc_access_token=' + ${JSON.stringify(accessToken || '')} + '; path=/';
      } catch(e) {}
    })();
    true;
  `;

  const isRetrying401Ref = useRef(false);

  const handleHttpError = useCallback(
    async (syntheticEvent: {nativeEvent: {statusCode: number}}) => {
      const {statusCode} = syntheticEvent.nativeEvent;
      if (statusCode === 401 && !isRetrying401Ref.current) {
        isRetrying401Ref.current = true;
        setIsRetrying401(true);
        const newToken = await refresh();
        if (newToken && webViewRef.current) {
          const escaped = JSON.stringify(newToken);
          const reInject = `
            (function() {
              try {
                localStorage.setItem('oc_access_token', ${escaped});
              } catch(e) {}
            })();
            true;
          `;
          webViewRef.current.injectJavaScript(reInject);
          webViewRef.current.reload();
        }
      }
    },
    [refresh],
  );

  const handleNavigationStateChange = useCallback(
    (_nav: WebViewNavigation) => {
      isRetrying401Ref.current = false;
      setIsRetrying401(false);
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: project.url}}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onHttpError={handleHttpError}
        onNavigationStateChange={handleNavigationStateChange}
        allowsBackForwardNavigationGestures={true}
        pullToRefreshEnabled={true}
        sharedCookiesEnabled={true}
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
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
