import { createContext, useContext, useEffect, useState } from "react";
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import type { ReactNode } from 'react'
import { auth, googleProvider } from '../../lib/firebase'
import { createOrUpdateUser } from "../../lib/firestoreService";

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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)

            if (user) {
                try {
                    await createOrUpdateUser(
                        user.uid,
                        user.email || '',
                        user.displayName || 'Usuario',
                        user.photoURL || undefined
                    )
                } catch (error) {
                    console.log('Error guardando Usuario', error)
                }
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)

            await createOrUpdateUser(
                result.user.uid,
                result.user.email || '',
                result.user.displayName || 'Usuario',
                result.user.photoURL || undefined
            )

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
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
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