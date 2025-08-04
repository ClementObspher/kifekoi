import { EventResponse, getEvents } from "@/api/event"
import { EventItem } from "@/components/ui/EventItem"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useGetToken } from "@/hooks/useGetToken"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useQuery } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function EventsScreen() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredEvents, setFilteredEvents] = useState<EventResponse[]>([])
    const [filteredBy, setFilteredBy] = useState<"all" | "my" | "going">("all")
    const { showActionSheetWithOptions } = useActionSheet()
    const { decodedToken } = useGetToken()

    const { data, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: getEvents,
    })

    useEffect(() => {
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
        filterEvents(searchQuery)
    }, [searchQuery, data])

    useEffect(() => {
        if (filteredBy === "my") {
            setFilteredEvents(data?.filter((event) => event.ownerId === decodedToken?.userId) ?? [])
        } else if (filteredBy === "going") {
            setFilteredEvents(data?.filter((event) => event.participants.some((participant) => participant.id === decodedToken?.userId)) ?? [])
        } else {
            setFilteredEvents(data ?? [])
        }
    }, [filteredBy, data, decodedToken])

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput} placeholder="Rechercher un événement..." onChangeText={(text) => setSearchQuery(text)} />
                <TouchableOpacity
                    onPress={() =>
                        showActionSheetWithOptions(
                            {
                                title: "Filtrer par",
                                options: ["Tous", "Mes événements", "J'y vais"],
                                cancelButtonIndex: 0,
                            },
                            (index) => {
                                if (index === 0) {
                                    setFilteredBy("all")
                                } else if (index === 1) {
                                    setFilteredBy("my")
                                } else if (index === 2) {
                                    setFilteredBy("going")
                                }
                            }
                        )
                    }
                >
                    <IconSymbol name="line.3.horizontal.decrease.circle.fill" size={40} color="#0000ff" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={searchQuery.length > 0 || filteredBy !== "all" ? filteredEvents : data}
                renderItem={EventItem}
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
    searchContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    searchInput: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        width: "80%",
    },
    listContainer: {
        paddingBottom: 32,
    },
})
