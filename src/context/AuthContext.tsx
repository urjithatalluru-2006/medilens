import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { auth, sendUserEmailVerification, sendUserPasswordReset, getFriendlyErrorMessage } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  reloadUser: () => Promise<boolean>;
  sendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<{ success: boolean; message: string }>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: (currentPassword?: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setEmailVerified(currentUser ? currentUser.emailVerified : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reloadUser = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      setEmailVerified(updatedUser.emailVerified);
      return updatedUser.emailVerified;
    } catch (error) {
      console.error("Error reloading user:", error);
      return false;
    }
  };

  const sendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { success: false, message: "No authenticated user found." };
    }
    try {
      await sendUserEmailVerification(auth.currentUser);
      return { 
        success: true, 
        message: `Verification link sent to ${auth.currentUser.email}. Please check your inbox and spam folder.` 
      };
    } catch (error: any) {
      console.error("Failed to send email verification:", error);
      return { success: false, message: getFriendlyErrorMessage(error) };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendUserPasswordReset(email);
      return { 
        success: true, 
        message: `Password reset instructions sent to ${email}. Check your inbox!` 
      };
    } catch (error: any) {
      console.error("Failed to send password reset:", error);
      return { success: false, message: getFriendlyErrorMessage(error) };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { success: false, message: "User is not logged in." };
    }
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL?.trim() || undefined
      });
      // Force reload to get updated profile
      await reloadUser();
      return { success: true, message: "Profile successfully updated!" };
    } catch (error: any) {
      return { success: false, message: getFriendlyErrorMessage(error) };
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return { success: false, message: "No active user session." };
    }

    try {
      // Re-authenticate before sensitive password change
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      return { success: true, message: "Password updated successfully!" };
    } catch (error: any) {
      return { success: false, message: getFriendlyErrorMessage(error) };
    }
  };

  const deleteAccount = async (currentPassword?: string): Promise<{ success: boolean; message: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, message: "No active user." };
    }

    try {
      if (currentPassword && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }
      await deleteUser(currentUser);
      return { success: true, message: "Account has been deleted successfully." };
    } catch (error: any) {
      return { success: false, message: getFriendlyErrorMessage(error) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerified,
        reloadUser,
        sendVerificationEmail,
        sendPasswordReset,
        logout,
        updateUserProfile,
        updateUserPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
