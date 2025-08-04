import { getEventsByUserId } from "@/api/event"
import { ModalEventItem } from "@/components/ui/EventItem"
import { useQuery } from "@tanstack/react-query"
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native"

export default function MyEvents() {
    const { data: events, isLoading: eventsLoading } = useQuery({
        queryKey: ["events"],
        queryFn: () => getEventsByUserId(),
    })

    return (
        <View style={styles.friendModal}>
            <Text style={[styles.sectionTitle, { textAlign: "center" }]}>Mes évènements</Text>
            {eventsLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
            ) : events && events.length > 0 ? (
                <FlatList data={events} renderItem={ModalEventItem} keyExtractor={(item) => item.slug} contentContainerStyle={styles.listContainer} />
            ) : (
                <Text>Aucun évènement trouvé</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: 16,
        backgroundColor: "#fff",
    },
    section: {
        width: "100%",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    messageInputContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        fontSize: 16,
        width: "100%",
        marginBottom: 10,
    },
    messagesContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    emptyMessages: {
        width: "100%",
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        height: "70%",
    },
    emptyMessagesText: {
        fontSize: 16,
        color: "#444",
    },
    myMessage: {
        backgroundColor: "#0000ff",
        padding: 10,
        borderRadius: 10,
        maxWidth: "80%",
        alignSelf: "flex-end",
    },
    otherMessage: {
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderRadius: 10,
        maxWidth: "80%",
        alignSelf: "flex-start",
    },
    myMessageText: {
        color: "#fff",
    },
    otherMessageText: {
        color: "#000",
    },
    updateModale: {
        gap: 16,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
    },
    messageContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    messageDateContainer: {
        flexDirection: "row",
        alignSelf: "flex-end",
        gap: 4,
        marginRight: 30,
    },
    otherMessageDateContainer: {
        flexDirection: "row",
        alignSelf: "flex-start",
        gap: 4,
        marginLeft: 30,
    },
    messageDate: {
        fontSize: 8,
        color: "#444",
    },
    messageAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    myMessageAvatarContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
    },
    otherMessageAvatarContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 4,
    },
    friendContainer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    friendAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    friendModal: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    friendList: {
        width: "100%",
        height: "100%",
        padding: 16,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 20,
    },
    friendInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    listContainer: {
        paddingBottom: 32,
    },
})
