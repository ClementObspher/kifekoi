import { cancelParticipationToEvent, getEvent, participateToEvent } from "@/api/event"
import ColoredLabel from "@/components/ColoredLabel"
import { useGetToken } from "@/hooks/useGetToken"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BlurView } from "expo-blur"
import { router, useLocalSearchParams } from "expo-router"
import React, { useMemo } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const queryClient = useQueryClient()
    const { decodedToken } = useGetToken()

    const { data: event, isLoading } = useQuery({
        queryKey: ["event", id],
        queryFn: () => getEvent(id),
    })

    const participateMutation = useMutation({
        mutationFn: () => participateToEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", id] })
            queryClient.invalidateQueries({ queryKey: ["events"] })
        },
    })

    const cancelParticipationMutation = useMutation({
        mutationFn: () => cancelParticipationToEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", id] })
        },
    })

    const isParticipating = useMemo(() => event?.participants.some((participant) => participant.id === decodedToken?.userId), [event, decodedToken])
    const isEventOwner = useMemo(() => event?.ownerId === decodedToken?.userId, [event, decodedToken])

    const handleAvatarPress = (id: string) => {
        if (id === decodedToken?.userId) {
            router.push(`/profile`)
        } else {
            router.push(`/user/${id}`)
        }
    }

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
            <View style={styles.divider} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentContainer}>
                    <Image source={{ uri: event.coverImage }} style={styles.coverImage} resizeMode="cover" />
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.type}>{event.type}</Text>
                    <Text style={styles.date}>
                        Du {new Date(event.startDate).toLocaleDateString()} au {new Date(event.endDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.divider} />
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lieu</Text>
                        <Text style={styles.location}>
                            {event.address?.number} {event.address?.street}, {event.address?.city} {event.address?.postal_code}, {event.address?.country}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Participants ({event.participants.length})</Text>
                        <View style={styles.participantsContainer}>
                            {event.participants.length <= 3
                                ? event.participants.map((participant) => (
                                      <TouchableOpacity style={styles.participant} key={participant.id} onPress={() => handleAvatarPress(participant.id)}>
                                          <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                                          <Text style={styles.participantName}>
                                              {participant.firstname} {participant.lastname.charAt(0)}
                                          </Text>
                                      </TouchableOpacity>
                                  ))
                                : event.participants.slice(0, 3).map((participant, index) => (
                                      <TouchableOpacity
                                          style={{ position: "absolute", top: 0, left: 0 + index * 20, borderWidth: 1, borderColor: "#eee", borderRadius: 16 }}
                                          key={participant.id}
                                          onPress={() => handleAvatarPress(participant.id)}
                                      >
                                          <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                                      </TouchableOpacity>
                                  ))}
                            {event.participants.length > 3 && (
                                <TouchableOpacity
                                    style={[styles.particpantsIndicator, { top: 0, left: 0 + (event.participants.length - 1) * 20 }]}
                                    onPress={() => router.push(`/modal?id=${id}&type=event-participants`)}
                                >
                                    <Text style={styles.participantName}>+{event.participants.length - 3}</Text>
                                </TouchableOpacity>
                            )}
                            {event.participants.length === 0 && (
                                <View style={styles.emptyParticipant}>
                                    <ColoredLabel text="Aucun participant pour l'instant" textStyle={{ fontSize: 12, color: "#444", fontWeight: "light" }} />
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.messagesButton} onPress={() => router.push(`/modal?id=${id}&type=chat`)}>
                        <Text style={styles.messagesButtonText}>Consulter les messages</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={isEventOwner ? styles.updateEventButton : isParticipating ? styles.removeParticipateButton : styles.participateButton}
                    onPress={() =>
                        isEventOwner ? router.push(`/create-event?id=${id}&type=update`) : isParticipating ? cancelParticipationMutation.mutate() : participateMutation.mutate()
                    }
                    disabled={participateMutation.isPending || cancelParticipationMutation.isPending}
                >
                    {participateMutation.isPending || cancelParticipationMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : isEventOwner ? (
                        <Text style={styles.participateButtonText}>Modifier l&apos;événement</Text>
                    ) : isParticipating ? (
                        <Text style={styles.participateButtonText}>Ne plus participer</Text>
                    ) : (
                        <Text style={styles.participateButtonText}>Participer à l&apos;événement</Text>
                    )}
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
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 10,
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
        gap: 16,
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
    section: {},
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
    updateEventButton: {
        backgroundColor: "#fb5d18",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    removeParticipateButton: {
        backgroundColor: "#ff0000",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    participateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    participantsContainer: {
        flexDirection: "row",
        gap: 16,
        minHeight: 32,
    },
    participant: {
        flexDirection: "column",
        alignItems: "center",
    },
    participantAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    participantName: {
        fontSize: 10,
    },
    particpantsIndicator: {
        position: "absolute",
        backgroundColor: "#eee",
        width: 32,
        height: 32,
        borderRadius: "50%",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyParticipant: {
        width: "100%",
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyParticipantText: {
        fontSize: 16,
        color: "#444",
    },
    messagesButton: {
        backgroundColor: "#000",
        padding: 20,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
    },
    messagesButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    divider: {
        height: 1,
        backgroundColor: "#eee",
    },
})
