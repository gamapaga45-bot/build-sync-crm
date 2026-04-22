/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, User, db, doc, getDoc, setDoc, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Fetch or create profile
          const userDocRef = doc(db, 'users', user.uid);
          const profileDoc = await getDoc(userDocRef);
          
          if (profileDoc.exists()) {
            const existingProfile = profileDoc.data() as UserProfile;
            // Ensure specific user is always admin
            if (user.email === 'gamapaga45@gmail.com' && existingProfile.role !== 'admin') {
              existingProfile.role = 'admin';
              try {
                await setDoc(userDocRef, existingProfile);
              } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
              }
            }
            setProfile(existingProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || undefined,
              role: user.email === 'gamapaga45@gmail.com' ? 'admin' : 'engineer',
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
            }
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching/creating profile:', error);
          // If we already handled it inside, this might be redundant but good for top-level catch
          if (error instanceof Error && !error.message.includes('authInfo')) {
             handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
