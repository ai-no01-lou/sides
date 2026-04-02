import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {useAuth} from '../auth/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

interface Props {
  visible: boolean;
  onClose: () => void;
}

function AuthenticatedView({onClose}: {onClose: () => void}) {
  const {userEmail, userName, logout} = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <View style={styles.content}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <MaterialDesignIcons name="account" size={32} color="#fff" />
        </View>
        {userName ? (
          <Text style={styles.userName}>{userName}</Text>
        ) : null}
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}>
        <MaterialDesignIcons name="logout" size={20} color="#7A687F" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginForm({onSuccess}: {onSuccess: () => void}) {
  const {login, register} = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(trimmedEmail, trimmedPassword, name.trim() || undefined);
      } else {
        await login(trimmedEmail, trimmedPassword);
      }
      onSuccess();
    } catch (e: any) {
      const msg = e.message || 'Something went wrong';
      if (isRegister && e.status === 409) {
        setIsRegister(false);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.content}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.formTitle}>
        {isRegister ? 'Create Account' : 'Sign In'}
      </Text>
      <Text style={styles.formSubtitle}>
        {isRegister
          ? 'Create an account to sync across apps'
          : 'Sign in to sync across apps'}
      </Text>

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Name (optional)"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setIsRegister(!isRegister);
          setError('');
        }}
        style={styles.toggle}>
        <Text style={styles.toggleText}>
          {isRegister
            ? 'Already have an account? Sign In'
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

export function ProfileDrawer({visible, onClose}: Props) {
  const {isAuthenticated} = useAuth();
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, slideAnim, overlayAnim]);

  if (!mounted) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, {opacity: overlayAnim}]} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.drawer,
          {transform: [{translateX: slideAnim}]},
        ]}>
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <MaterialDesignIcons name="close" size={24} color="#4B4B4B" />
          </TouchableOpacity>
        </View>
        {isAuthenticated ? (
          <AuthenticatedView onClose={onClose} />
        ) : (
          <LoginForm onSuccess={onClose} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: {width: -3, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  // Authenticated view
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7A687F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B4B4B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 15,
    color: '#7A687F',
    fontWeight: '500',
  },
  // Login form
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4B4B4B',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#4B4B4B',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  error: {
    color: '#e74c3c',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#7A687F',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#7A687F',
    fontSize: 13,
  },
});
