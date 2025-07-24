import AsyncStorage from "@react-native-async-storage/async-storage"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"

export const useGetToken = () => {
    const [token, setToken] = useState<string | null>(null)
    const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem("token")
            setToken(token)
            if (!token) {
                return
            }
            const decodedToken = jwtDecode(token) as DecodedToken
            setDecodedToken(decodedToken)
        }
        getToken()
    }, [])

    return { token, decodedToken }
}
