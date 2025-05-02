import { createContext, useState, useEffect, useContext } from 'react';
import {
    getFirebaseAuth,
    saveUserData
} from '../services/firebaseService';
import {
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { isAuthenticated, getUserInfo } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLocalStorage = () => {
            if (isAuthenticated()) {
                const userInfo = getUserInfo();
                if (userInfo) {
                    setUser(userInfo);
                }
            }
        };

        checkLocalStorage();

        const auth = getFirebaseAuth();
        if (!auth) {
            setLoading(false);
            return;
        }

        const checkRedirectResult = async () => {
            try {
                setLoading(true);
                const result = await getRedirectResult(auth);
                if (result && result.user) {
                    const firebaseUser = result.user;
                    const token = await firebaseUser.getIdToken(true);
                    const userData = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        picture: firebaseUser.photoURL
                    };
                    localStorage.setItem('user_info', JSON.stringify(userData));
                    localStorage.setItem('auth_token', token || firebaseUser.accessToken || '');
                    await saveUserData(userData.id, {
                        name: userData.name,
                        email: userData.email,
                        picture: userData.picture
                    });
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error handling redirect result:', error);
            } finally {
                setLoading(false);
            }
        };

        checkRedirectResult();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                const formattedUser = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    picture: firebaseUser.photoURL
                };
                localStorage.setItem('user_info', JSON.stringify(formattedUser));
                const token = await firebaseUser.getIdToken(true);
                localStorage.setItem('auth_token', token || firebaseUser.accessToken || '');
                setUser(formattedUser);
            } else {
                const userInfo = localStorage.getItem('user_info');
                const authToken = localStorage.getItem('auth_token');
                if (userInfo && authToken) {
                    const userData = JSON.parse(userInfo);
                    if (userData && userData.id) {
                        setUser(userData);
                        setLoading(false);
                        return;
                    }
                }
                setUser(null);
                localStorage.removeItem('user_info');
                localStorage.removeItem('auth_token');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const auth = getFirebaseAuth();
            if (!auth) {
                throw new Error("Firebase Auth not initialized");
            }
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            provider.setCustomParameters({
                'login_hint': 'user@example.com',
                'locale': 'vi',
                'prompt': 'select_account'
            });
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw new Error('Sign-in failed, please try again');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const auth = getFirebaseAuth();
            await firebaseSignOut(auth);
            setUser(null);
            localStorage.removeItem('user_info');
            localStorage.removeItem('auth_token');
        } catch (error) {
            console.error('Sign-out error:', error);
            localStorage.removeItem('user_info');
            localStorage.removeItem('auth_token');
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        signInWithGoogle,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
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

export default AuthContext;
