import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  sendEmailVerification as fbSendEmailVerification,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  User
} from "firebase/auth";

// Web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyDvRMx_oXMVAIp9SVIOB0AE0C8oEokiTx0",
  authDomain: "medilens-ai-daab2.firebaseapp.com",
  projectId: "medilens-ai-daab2",
  storageBucket: "medilens-ai-daab2.firebasestorage.app",
  messagingSenderId: "811022809239",
  appId: "1:811022809239:web:a97af4aedc2123042f11d2"
};

// Initialize Firebase safely preventing duplicate apps
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Friendly error message converter for Firebase Auth error codes
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";
  
  const errorCode = typeof error === "string" ? error : error.code || error.message || "";
  
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is not formatted correctly.";
    case "auth/user-disabled":
      return "This user account has been disabled by an administrator.";
    case "auth/user-not-found":
      return "No account was found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case "auth/invalid-credential":
      return "Invalid email or password credentials. Please double check.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Try logging in.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console. Please enable it under Firebase Console > Authentication > Sign-in method.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters including numbers and letters.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing authentication.";
    case "auth/popup-blocked":
      return "The browser blocked the sign-in popup. Please allow popups for this site.";
    case "auth/requires-recent-login":
      return "This sensitive operation requires recent login. Please log out and sign in again.";
    case "auth/too-many-requests":
      return "Too many attempts from this device. Please wait a few moments and try again.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Console > Authentication > Settings > Authorized domains.";
    default:
      return error.message || "An authentication error occurred. Please try again.";
  }
}

// Action URL settings (optional redirect after email verification)
export async function sendUserEmailVerification(user: User): Promise<void> {
  await fbSendEmailVerification(user);
}

export async function sendUserPasswordReset(email: string): Promise<void> {
  await fbSendPasswordResetEmail(auth, email);
}
