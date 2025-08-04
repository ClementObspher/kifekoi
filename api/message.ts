import { fetchData } from "."

export interface Message {
    id: string
    eventId: string
    userId: string
    content: string
    user: {
        id: string
        firstName: string
        lastName: string
        avatar: string
        role: "ADMIN" | "USER"
    }
    createdAt: string
    updatedAt: string
    reactions: MessageReaction[]
}

export enum MessageReactionType {
    LIKE = "LIKE",
    DISLIKE = "DISLIKE",
    LOVE = "LOVE",
}

export interface MessageReaction {
    id: string
    messageId: string
    userId: string
    type: MessageReactionType
    sender: {
        id: string
        firstname: string
        lastname: string
        avatar: string
        role: "ADMIN" | "USER"
    }
}

export interface MessageRequest {
    eventId: string
    userId: string
    content: string
}

export interface PrivateMessage {
    id: string
    messageId: string
    userId: string
    type: MessageReactionType
}

export interface MessageService {
    getMessageById: (id: string) => Promise<Message>
    getMessagesByEventId: (eventId: string) => Promise<Message[]>
    createMessage: (message: MessageRequest) => Promise<Message>
    updateMessage: (id: string, message: MessageRequest) => Promise<Message>
    getMessageReactions: (messageId: string) => Promise<MessageReaction[]>
    createMessageReaction: (messageId: string, userId: string, type: MessageReactionType) => Promise<MessageReaction>
    updateMessageReaction: (messageId: string, userId: string, type: MessageReactionType) => Promise<MessageReaction>
    deleteMessageReaction: (messageId: string, userId: string) => Promise<void>
}

export async function getMessageById(id: string): Promise<Message> {
    const response = await fetchData(`/messages/${id}`, "GET")
    return response.json()
}

export async function getMessagesByEventId(eventId: string): Promise<Message[]> {
    const response = await fetchData(`/messages/event/${eventId}`, "GET")
    return response.json()
}

export async function createMessage(message: MessageRequest): Promise<Message> {
    const response = await fetchData(`/messages`, "POST", JSON.stringify(message))
    return response.json()
}

export async function updateMessage(id: string, content: string): Promise<Message> {
    const response = await fetchData(`/messages/${id}`, "PUT", JSON.stringify({ content }))
    return response.json()
}

export async function addReaction(messageId: string, userId: string, type: MessageReactionType): Promise<MessageReaction> {
    const response = await fetchData(`/message-reactions`, "POST", JSON.stringify({ messageId, userId, type }))
    return response.json()
}

export async function updateReaction(id: string, type: MessageReactionType): Promise<MessageReaction> {
    const response = await fetchData(`/message-reactions/${id}`, "PUT", JSON.stringify({ type }))
    return response.json()
}

export async function removeReaction(id: string): Promise<void> {
    const response = await fetchData(`/message-reactions/${id}`, "DELETE")
    return response.json()
}
