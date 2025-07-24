import { isAuthenticated } from "@/api/auth"
import { Redirect } from "expo-router"
import { useEffect, useState } from "react"

export default function Index() {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuth, setIsAuth] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const authenticated = await isAuthenticated()
            setIsAuth(authenticated)
        } catch (error) {
            console.error("Erreur lors de la vérification de l'authentification:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return null
    }

    return <Redirect href={isAuth ? "/(tabs)" : "/login"} />
}
