import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '../config/firebase';

interface FirestoreHookState<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useFirestoreDocument<T>(
  collection: string,
  documentId: string | null
): FirestoreHookState<T> {
  const [state, setState] = useState<FirestoreHookState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!documentId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const documentRef = doc(db, collection, documentId);

    const unsubscribe = onSnapshot(
      documentRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          setState({
            data: snapshot.data() as T,
            loading: false,
            error: null,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: null,
          });
        }
      },
      (error: FirestoreError) => {
        setState({
          data: null,
          loading: false,
          error,
        });
      }
    );

    return () => unsubscribe();
  }, [collection, documentId]);

  return state;
}

export function useFirestoreConnection() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simple connection check - in a real app you might want to use
    // Firebase's built-in connection state monitoring
    const checkConnection = async () => {
      try {
        // Try to read a small document or use Firebase's connection state
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return isOnline;
}