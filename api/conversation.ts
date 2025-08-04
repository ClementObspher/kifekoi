import { fetchData } from "."
import { MessageReaction, MessageReactionType } from "./message"

export interface Conversation {
    id: string
    createdAt: string
    updatedAt: string
    participants: {
        id: string
        firstname: string
        lastname: string
        avatar: string
    }[]
    privateMessages: PrivateMessage[]
}

export interface PrivateMessage {
    id: string
    content: string
    conversationId: string
    senderId: string
    isRead: boolean
    createdAt: string
    updatedAt: string
    reactions: MessageReaction[]
}

export interface ConversationService {
    getConversationById: (conversationId: string) => Promise<Conversation>
    getConversationByUserId: (friendId: string) => Promise<Conversation>
    createConversation: (friendId: string) => Promise<Conversation>
    pushMessage: (conversationId: string, message: string) => Promise<PrivateMessage>
}

export async function getConversationById(conversationId: string): Promise<Conversation> {
    const response = await fetchData(`/conversations/${conversationId}`, "GET")
    return response.json()
}

export async function getConversationByUserId(friendId: string): Promise<Conversation> {
    const response = await fetchData(`/conversations?friendId=${friendId}`, "GET")
    return response.json()
}

export async function createConversation(friendId: string): Promise<Conversation> {
    const response = await fetchData(`/conversations?friendId=${friendId}`, "POST")
    return response.json()
}

export async function pushMessage(conversationId: string, message: string): Promise<PrivateMessage> {
    const response = await fetchData(`/conversations/${conversationId}/messages`, "POST", JSON.stringify({ message }))
    return response.json()
}

export async function updatePrivateMessage(messageId: string, content: string): Promise<PrivateMessage> {
    const response = await fetchData(`/conversations/messages/${messageId}`, "PUT", JSON.stringify({ content }))
    return response.json()
}

export async function addReaction(messageId: string, userId: string, type: MessageReactionType): Promise<MessageReaction> {
    const response = await fetchData(`/private-message-reactions`, "POST", JSON.stringify({ messageId, userId, type }))
    return response.json()
}

export async function updateReaction(id: string, type: MessageReactionType): Promise<MessageReaction> {
    const response = await fetchData(`/private-message-reactions/${id}`, "PUT", JSON.stringify({ type }))
    return response.json()
}

export async function removeReaction(id: string): Promise<void> {
    const response = await fetchData(`/private-message-reactions/${id}`, "DELETE")
    return response.json()
}
