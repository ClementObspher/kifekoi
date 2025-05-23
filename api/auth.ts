import AsyncStorage from "@react-native-async-storage/async-storage"
import { fetchData } from "."

export interface AuthResponse {
    token: string
    user: {
        id: string
        email: string
        role: "USER" | "ADMIN"
    }
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials extends LoginCredentials {
    name: string
}

export interface AuthService {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>
    register: (credentials: RegisterCredentials) => Promise<AuthResponse>
    logout: () => void
    getToken: () => string | undefined
    isAuthenticated: () => boolean
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
        const response = await fetchData("/auth/login", "POST", JSON.stringify(credentials))
        const data = await response.json()
        console.log(data)
        if (data.token) {
            await AsyncStorage.setItem("token", data.token)
        }
        return data
    } catch (error) {
        console.error("Erreur lors de la connexion:", error)
        throw error
    }
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
        const response = await fetchData("/auth/register", "POST", JSON.stringify(credentials))
        return response.json()
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error)
        throw error
    }
}

export async function logout() {
    try {
        await AsyncStorage.removeItem("token")
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error)
        throw error
    }
}

export async function getToken() {
    return await AsyncStorage.getItem("token")
}

export async function isAuthenticated() {
    return (await AsyncStorage.getItem("token")) !== null
}
