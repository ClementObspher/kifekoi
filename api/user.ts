import AsyncStorage from "@react-native-async-storage/async-storage"
import { jwtDecode } from "jwt-decode"
import { fetchData } from "."

export interface UserResponse {
    id: string
    firstname: string
    lastname: string
    email: string
    role: string
    avatar: string | null
    bio: string | null
    birthdate: Date | null
    nationality: string | null
}

export interface FriendRequest {
    id: string
    senderId: string
    receiverId: string
    status: string
    sender: {
        id: string
        firstname: string
        lastname: string
        avatar: string | null
    }
    receiver: {
        id: string
        firstname: string
        lastname: string
        avatar: string | null
    }
}

export interface UserService {
    getProfile: () => Promise<UserResponse>
    getUserById: (id: string) => Promise<UserResponse>
    sendFriendRequest: (userId: string) => Promise<void>
    getPendingFriendRequests: () => Promise<FriendRequest[]>
    getSentFriendRequests: () => Promise<FriendRequest[]>
    acceptFriendRequest: (requestId: string) => Promise<void>
    rejectFriendRequest: (requestId: string) => Promise<void>
    cancelFriendRequest: (requestId: string) => Promise<void>
    getFriends: () => Promise<UserResponse[]>
    removeFriend: (friendId: string) => Promise<void>
}

export async function getProfile(): Promise<UserResponse> {
    const token = await AsyncStorage.getItem("token")
    if (!token) {
        throw new Error("No token found")
    }
    const user = jwtDecode(token) as DecodedToken
    const response = await fetchData(`/users/${user.userId}`, "GET")
    return response.json()
}

export async function getUserById(id: string): Promise<UserResponse> {
    const response = await fetchData(`/users/${id}`, "GET")
    return response.json()
}

export async function sendFriendRequest(friendId: string): Promise<void> {
    const response = await fetchData(`/users/friend-requests/send`, "POST", JSON.stringify({ friendId }))
    return response.json()
}

export async function getPendingFriendRequests(): Promise<FriendRequest[]> {
    const response = await fetchData(`/users/friend-requests/received`, "GET")
    return response.json()
}

export async function getSentFriendRequests(): Promise<FriendRequest[]> {
    const response = await fetchData(`/users/friend-requests/sent`, "GET")
    return response.json()
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
    const response = await fetchData(`/users/friend-requests/accept`, "POST", JSON.stringify({ requestId }))
    return response.json()
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
    const response = await fetchData(`/users/friend-requests/decline`, "POST", JSON.stringify({ requestId }))
    return response.json()
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
    const response = await fetchData(`/users/friend-requests/cancel`, "POST", JSON.stringify({ requestId }))
    return response.json()
}

export async function getFriends(): Promise<UserResponse[]> {
    const response = await fetchData(`/users/friends`, "GET")
    return response.json()
}

export async function removeFriend(friendId: string): Promise<void> {
    const response = await fetchData(`/users/friends/${friendId}`, "DELETE")
    return response.json()
}
