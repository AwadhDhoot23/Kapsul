// lib/firestore.js
// Helper functions for Firestore operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// ========== USER OPERATIONS ==========

export const createUser = async (uid, userData) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            ...userData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const getUser = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

export const updateUser = async (uid, userData) => {
    try {
        await updateDoc(doc(db, 'users', uid), userData);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// ========== ITEM OPERATIONS ==========

export const createItem = async (uid, itemData) => {
    try {
        const itemRef = doc(collection(db, 'items'));
        await setDoc(itemRef, {
            ...itemData,
            userId: uid,
            status: 'active',
            isPinned: false,
            isCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return itemRef.id;
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
};

// Alias for clarity
export const addItem = createItem;

export const getUserItems = (uid, filters = {}, onItemUpdate) => {
    try {
        const itemsRef = collection(db, 'items');
        // Initial query without orderBy to avoid index errors
        let q = query(
            itemsRef,
            where('userId', '==', uid)
        );

        // Apply filters
        if (filters.isCompleted !== undefined) {
            q = query(
                itemsRef,
                where('userId', '==', uid),
                where('isCompleted', '==', filters.isCompleted)
            );
        }

        // Return the unsubscribe function
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort client-side
            items.sort((a, b) => {
                const dateA = a.createdAt?.toMillis?.() || 0;
                const dateB = b.createdAt?.toMillis?.() || 0;
                return dateB - dateA;
            });

            if (onItemUpdate) onItemUpdate(items);
        }, (error) => {
            console.error('Error getting user items:', error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up listener:', error);
        throw error;
    }
};

// Legacy promise-based fetch for compatibility if needed (but we should switch to real-time)
export const fetchUserItemsOnce = async (uid, filters = {}) => {
    try {
        const itemsRef = collection(db, 'items');
        let q = query(
            itemsRef,
            where('userId', '==', uid)
        );

        if (filters.isCompleted !== undefined) {
            q = query(
                itemsRef,
                where('userId', '==', uid),
                where('isCompleted', '==', filters.isCompleted)
            );
        }

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        items.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
        });

        return items;
    } catch (error) {
        console.error('Error getting user items:', error);
        throw error;
    }
};



export const updateItem = async (itemId, updates) => {
    try {
        await updateDoc(doc(db, 'items', itemId), updates);
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};

export const deleteItem = async (itemId) => {
    try {
        await deleteDoc(doc(db, 'items', itemId));
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};



// ========== FEEDBACK OPERATIONS ==========

export const submitFeedback = async (uid, feedbackData) => {
    try {
        const feedbackRef = doc(collection(db, 'feedback'));
        await setDoc(feedbackRef, {
            ...feedbackData,
            uid,
            status: 'open',
            createdAt: serverTimestamp(),
        });
        return feedbackRef.id;
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }
};

export { Timestamp, serverTimestamp };
