// Firebase configuration (CDN version - no npm needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, arrayUnion, arrayRemove, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 ضع بيانات Firebase الخاصة بك هنا (انسخها من Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDzTBpIs2hD5iTevH3akIpXzZKmzsI1xoc",
  authDomain: "learning-app123.firebaseapp.com",
  projectId: "learning-app123",
  storageBucket: "learning-app123.firebasestorage.app",
  messagingSenderId: "455956215640",
  appId: "1:455956215640:web:fd11d83456c8b326ca172d",
  measurementId: "G-YV2JT8WH7L"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// تصدير الدوال والمتغيرات لاستخدامها في الملفات الأخرى
export { 
    auth, db, 
    signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    signOut, updateProfile,
    doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where,
    arrayUnion, arrayRemove, addDoc
};