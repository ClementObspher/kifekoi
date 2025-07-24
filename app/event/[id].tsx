import { getEventById, participateToEvent } from "@/api/event"
import { useGetToken } from "@/hooks/useGetToken"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BlurView } from "expo-blur"
import { router, useLocalSearchParams } from "expo-router"
import React from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const queryClient = useQueryClient()
    const { decodedToken } = useGetToken()

    const { data: event, isLoading } = useQuery({
        queryKey: ["event", id],
        queryFn: () => getEventById(id),
    })

    const participateMutation = useMutation({
        mutationFn: () => participateToEvent(id, decodedToken?.userId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", id] })
        },
    })

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Événement non trouvé</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <BlurView intensity={100} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Retour</Text>
                </TouchableOpacity>
            </BlurView>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentContainer}>
                    <Image source={{ uri: event.coverImage }} style={styles.coverImage} resizeMode="cover" />
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.type}>{event.type}</Text>
                    <Text style={styles.date}>
                        Du {new Date(event.startDate).toLocaleDateString()} au {new Date(event.endDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lieu</Text>
                        <Text style={styles.location}>{event.address}</Text>
                        <Text style={styles.location}>
                            Latitude: {event.latitude}, Longitude: {event.longitude}
                        </Text>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.participateButton} onPress={() => participateMutation.mutate()} disabled={participateMutation.isPending}>
                    {participateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.participateButtonText}>Participer à l&apos;événement</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        padding: 16,
        zIndex: 1,
    },
    backButton: {
        fontSize: 16,
        color: "#0000ff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 18,
        color: "red",
    },
    scrollContent: {
        flexGrow: 1,
    },
    coverImage: {
        width: "100%",
        height: 250,
        borderRadius: 16,
    },
    contentContainer: {
        padding: 16,
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    type: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    date: {
        fontSize: 16,
        color: "#666",
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: "#444",
    },
    location: {
        fontSize: 16,
        color: "#444",
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    participateButton: {
        backgroundColor: "#0000ff",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    participateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
})
