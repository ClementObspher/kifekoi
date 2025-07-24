import { EventResponse, getEvents } from "@/api/event"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function EventsScreen() {
    const [filteredEvents, setFilteredEvents] = useState<EventResponse[]>([])

    const { data, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: getEvents,
    })

    const filterEvents = (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setFilteredEvents(data ?? [])
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = data?.filter(
            (event) => event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query) || event.type.toLowerCase().includes(query)
        )
        setFilteredEvents(filtered ?? [])
    }

    const renderEventItem = ({ item }: { item: EventResponse }) => (
        <TouchableOpacity style={styles.eventItem} onPress={() => router.push(`/event/${item.id}`)}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventType}>{item.type}</Text>
            <Text style={styles.eventDate}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
            </Text>
        </TouchableOpacity>
    )

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <TextInput style={styles.searchInput} placeholder="Rechercher un événement..." onChangeText={(text) => filterEvents(text)} />
            <FlatList
                data={filteredEvents.length > 0 ? filteredEvents : data}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.slug}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    searchInput: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    eventItem: {
        backgroundColor: "#f8f8f8",
        padding: 16,
        borderRadius: 8,
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
