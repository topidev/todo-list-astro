import { createContext, useContext, useEffect, useState } from "react";
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import type { ReactNode } from 'react'
import { auth, googleProvider } from '../../lib/firebase'

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.error('Error al iniciar Sesion:', error)
        }
    }

    const signOut = async () => {
        try {
            await firebaseSignOut(auth)
        } catch (error) {
            console.error('Error al cerrar Sesion:', error)
        }
    }

    return (
        <AuthContext.Provider value={{user, loading, signInWithGoogle, signOut}}>
            { children }
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de AuthProvier')
    }
    return context;
}