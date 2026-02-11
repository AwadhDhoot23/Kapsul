// store/authStore.js
import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUser, getUser, updateUser } from '../lib/firestore';

// Generate DiceBear avatar URL
const generateAvatar = (name) => {
    const seed = encodeURIComponent(name || Math.random().toString());
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`;
};

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    error: null,

    // Initialize auth listener
    initialize: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user data from Firestore
                const userData = await getUser(firebaseUser.uid);
                set({
                    user: { ...firebaseUser, ...userData },
                    loading: false
                });
            } else {
                set({ user: null, loading: false });
            }
        });
    },

    // Sign up with email and password
    signUp: async (name, email, password) => {
        try {
            set({ error: null });
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Generate avatar and save to Firestore
            const photoURL = generateAvatar(name);
            await createUser(user.uid, {
                uid: user.uid,
                email: user.email,
                displayName: name,
                photoURL,
                provider: 'password',
                themePreference: 'system',
            });

            return { success: true };
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        try {
            set({ error: null });
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Sign in with Google
    signInWithGoogle: async () => {
        try {
            set({ error: null });
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in Firestore
            const existingUser = await getUser(user.uid);

            if (!existingUser) {
                // New user - create profile
                await createUser(user.uid, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    provider: 'google',
                    themePreference: 'system',
                });
            }

            return { success: true };
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            set({ user: null, error: null });
            return { success: true };
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Update Profile
    updateProfile: async (updates) => {
        try {
            const { displayName } = updates;
            const currentUser = auth.currentUser;

            if (!currentUser) throw new Error('No user logged in');

            // 1. Update Firebase Auth Profile
            if (displayName) {
                await firebaseUpdateProfile(currentUser, { displayName });
            }

            // 2. Update Firestore User Document
            await updateUser(currentUser.uid, updates);

            // 3. Update Local State
            set((state) => ({
                user: { ...state.user, ...updates }
            }));

            return { success: true };
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
