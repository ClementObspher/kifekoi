import AsyncStorage from "@react-native-async-storage/async-storage"
import { jwtDecode } from "jwt-decode"
import { fetchData } from "."

export interface UserResponse {
    id: string
    name: string
    email: string
    role: string
    avatar: string | null
}

export interface UserService {
    getProfile: () => Promise<UserResponse>
}

export async function getProfile(): Promise<UserResponse> {
    const token = await AsyncStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const user = jwtDecode(token) as DecodedToken
    console.log(user)
    const response = await fetchData(`/users/${user.userId}`, "GET")
    return response.json()
}
