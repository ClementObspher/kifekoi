import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001"

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export async function fetchData(url: string, method: Method, body?: BodyInit | null, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem("token")

    const fullUrl = `${API_URL}${url}`

    const response = await fetch(fullUrl, {
        method,
        body: body,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        ...options,
    })

    return response
}
