import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdaYBWb-YAxZo4_rv4fSZkmm9Xl9TvMGQ",
  authDomain: "xhstouchgrass.firebaseapp.com",
  projectId: "xhstouchgrass",
  storageBucket: "xhstouchgrass.firebasestorage.app",
  messagingSenderId: "992035459845",
  appId: "1:992035459845:web:a9a30865e32481ad76dd6c",
  measurementId: "G-S7P8N96GXD"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app); 