interface AuthState {
    userName: string | null;
    isSignedIn: boolean;
    userId: string | null;
}

type AuthContext = {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
    refreshAuth: () => Promise<boolean>;
}