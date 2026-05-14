// src/api/firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const firebaseAuth = auth();
export const db = firestore();
export const fcm = messaging();

export const signIn = async (email: string, password: string) => {
  return await firebaseAuth.signInWithEmailAndPassword(email, password);
};

export const signUp = async (email: string, password: string) => {
  return await firebaseAuth.createUserWithEmailAndPassword(email, password);
};

export const signOut = async () => {
  return await firebaseAuth.signOut();
};