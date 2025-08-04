import { EventResponse } from "@/api/event"
import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export const EventItem = ({ item }: { item: EventResponse }) => (
    <TouchableOpacity style={styles.eventItem} onPress={() => router.push(`/event/${item.id}`)}>
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventType}>{item.type}</Text>
            <Text style={styles.eventDate}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
            </Text>
        </View>
    </TouchableOpacity>
)

export const ModalEventItem = ({ item }: { item: EventResponse }) => (
    <TouchableOpacity
        style={styles.eventItem}
        onPress={() => {
            router.back()
            router.push(`/event/${item.id}`)
        }}
    >
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventType}>{item.type}</Text>
            <Text style={styles.eventDate}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
            </Text>
        </View>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    eventItem: {
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        marginBottom: 12,
    },
    eventContent: {
        padding: 16,
    },
    coverImage: {
        width: "100%",
        height: 150,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    eventType: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 14,
        color: "#444",
    },
})
