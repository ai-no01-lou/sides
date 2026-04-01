import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.thislou.sides';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Keychain.setGenericPassword('tokens', JSON.stringify(tokens), {
    service: SERVICE_NAME,
  });
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const result = await Keychain.getGenericPassword({service: SERVICE_NAME});
  if (!result) {
    return null;
  }
  try {
    return JSON.parse(result.password);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({service: SERVICE_NAME});
}
