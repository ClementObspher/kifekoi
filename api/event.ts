import { fetchData } from "."

export enum EventStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
}

export enum EventType {
    MUSIC = "MUSIC",
    DANCE = "DANCE",
    THEATRE = "THEATRE",
    VISUAL_ART = "VISUAL_ART",
    LITERATURE = "LITERATURE",
    CINEMA = "CINEMA",
    SPORTS = "SPORTS",
    OTHER = "OTHER",
}

export interface EventResponse {
    id: string
    slug: string
    title: string
    description: string
    startDate: Date
    endDate: Date
    longitude: number
    latitude: number
    status: EventStatus
    type: EventType
    isPublic: boolean
    isFeatured: boolean
    coverImage: string
    ownerId: string
    address: string
}

export interface EventRequest {
    title: string
    description: string
    startDate: Date
    endDate: Date
    slug: string
    status: EventStatus
    type: EventType
    ownerId: string
    longitude: number
    latitude: number
    coverImage: string
    address: string
}

export interface EventService {
    getEvents: () => Promise<EventResponse[]>
    getEvent: (id: string) => Promise<EventResponse>
    createEvent: (event: EventResponse) => Promise<EventResponse>
    updateEvent: (id: string, event: EventResponse) => Promise<EventResponse>
    deleteEvent: (id: string) => Promise<void>
}

export async function getEvents(): Promise<EventResponse[]> {
    const response = await fetchData("/events", "GET")
    return response.json()
}

export async function getEvent(id: string): Promise<EventResponse> {
    const response = await fetchData(`/events/${id}`, "GET")
    return response.json()
}

export async function createEvent(event: EventRequest): Promise<EventResponse> {
    const response = await fetchData("/events", "POST", JSON.stringify(event))
    return response.json()
}

export async function updateEvent(id: string, event: EventResponse): Promise<EventResponse> {
    const response = await fetchData(`/events/${id}`, "PUT", JSON.stringify(event))
    return response.json()
}

export async function deleteEvent(id: string): Promise<void> {
    const response = await fetchData(`/events/${id}`, "DELETE")
    return response.json()
}

export async function getEventById(id: string): Promise<EventResponse> {
    const response = await fetchData(`/events/${id}`, "GET")
    return response.json()
}

export async function participateToEvent(id: string, userId: string): Promise<void> {
    const response = await fetchData(`/events/${userId}/participate/${id}`, "POST")
    return response.json()
}
