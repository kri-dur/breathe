import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onLogin) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '1038583728741-b451lkjhe71shpntr4rbscr7ebooee8l.apps.googleusercontent.com',
    expoClientId: '1038583728741-b451lkjhe71shpntr4rbscr7ebooee8l.apps.googleusercontent.com', 
    responseType: 'id_token',
    scopes: ['profile', 'email'],
    prompt: 'select_account',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then(() => {
        if (onLogin) onLogin();
      });
    }
  }, [response]);

  return { request, promptAsync };
}
