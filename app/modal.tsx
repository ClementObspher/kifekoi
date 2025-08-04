import Chat from "@/components/Chat"
import ChatUser from "@/components/ChatUser"
import EventParticipants from "@/components/EventParticipants"
import FriendsModalContent from "@/components/FriendsModalContent"
import MyEvents from "@/components/MyEvents"
import { useLocalSearchParams } from "expo-router"

export default function ModalRoot() {
    const { id, type } = useLocalSearchParams<{ id: string; type: "chat" | "update-form" | "friends" | "event-participants" | "my-events" | "chat-user" }>()

    if (type === "chat") {
        return <Chat eventId={id} />
    }

    if (type === "friends") {
        return <FriendsModalContent />
    }

    if (type === "event-participants") {
        return <EventParticipants id={id} />
    }

    if (type === "my-events") {
        return <MyEvents />
    }

    if (type === "chat-user") {
        return <ChatUser id={id} />
    }
}
