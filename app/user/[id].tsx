import { acceptFriendRequest, cancelFriendRequest, getFriends, getPendingFriendRequests, getSentFriendRequests, getUserById, removeFriend, sendFriendRequest } from "@/api/user"
import { ThemedView } from "@/components/ThemedView"
import { useGetToken } from "@/hooks/useGetToken"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BlurView } from "expo-blur"
import { router, useLocalSearchParams } from "expo-router"
import { useMemo } from "react"
import { ActivityIndicator, Button, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Toast } from "toastify-react-native"

export default function UserDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const queryClient = useQueryClient()
    const { decodedToken } = useGetToken()

    const { data: user, isLoading } = useQuery({
        queryKey: ["user", id],
        queryFn: () => getUserById(id),
    })

    const { data: friends, isLoading: friendsLoading } = useQuery({
        queryKey: ["friends"],
        queryFn: () => getFriends(),
    })

    const { data: sentFriendRequests, isLoading: sentFriendRequestsLoading } = useQuery({
        queryKey: ["sentFriendRequests"],
        queryFn: () => getSentFriendRequests(),
    })

    const { data: pendingFriendRequests, isLoading: pendingFriendRequestsLoading } = useQuery({
        queryKey: ["pendingFriendRequests"],
        queryFn: () => getPendingFriendRequests(),
    })

    const { mutate: sendFriendRequestMutation, isPending: isSendingFriendRequest } = useMutation({
        mutationFn: () => sendFriendRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] })
            queryClient.invalidateQueries({ queryKey: ["friends", id] })
            queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            queryClient.invalidateQueries({ queryKey: ["friends"] })
            Toast.success("Invitation envoyée !")
        },
    })

    const { mutate: removeFriendMutation, isPending: isRemovingFriend } = useMutation({
        mutationFn: () => removeFriend(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] })
            queryClient.invalidateQueries({ queryKey: ["friends", id] })
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            queryClient.invalidateQueries({ queryKey: ["friends"] })
            Toast.success("Ami supprimé !")
        },
    })

    const { mutate: cancelFriendRequestMutation, isPending: isCancellingFriendRequest } = useMutation({
        mutationFn: () => {
            const requestId = sentFriendRequests?.find((request) => request.receiverId === id)?.id
            if (!requestId) {
                throw new Error("Request ID not found")
            }
            return cancelFriendRequest(requestId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] })
            queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] })
            Toast.success("Invitation acceptée !")
        },
    })

    const { mutate: acceptFriendRequestMutation, isPending: isAcceptingFriendRequest } = useMutation({
        mutationFn: () => {
            const requestId = pendingFriendRequests?.find((request) => request.senderId === id)?.id
            if (!requestId) {
                throw new Error("Request ID not found")
            }
            return acceptFriendRequest(requestId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] })
            queryClient.invalidateQueries({ queryKey: ["friends", id] })
            queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            queryClient.invalidateQueries({ queryKey: ["friends"] })
            Toast.success("Invitation acceptée !")
        },
    })

    const isFriend = useMemo(() => {
        return friends?.some((friend) => friend.id === decodedToken?.userId)
    }, [friends, decodedToken?.userId])

    const isSentFriendRequest = useMemo(() => {
        return sentFriendRequests?.some((request) => request.receiverId === id)
    }, [sentFriendRequests, id])

    const isPendingFriendRequest = useMemo(() => {
        return pendingFriendRequests?.some((request) => request.senderId === id)
    }, [pendingFriendRequests, id])

    if (isLoading || friendsLoading || sentFriendRequestsLoading || pendingFriendRequestsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Utilisateur non trouvé</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <BlurView intensity={100} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Retour</Text>
                </TouchableOpacity>
            </BlurView>
            <ThemedView style={styles.container}>
                <Image source={{ uri: user?.avatar ?? "" }} style={styles.avatar} />
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text>Prénom</Text>
                        <TextInput style={styles.input} value={user?.firstname} />
                    </View>
                    <View style={styles.column}>
                        <Text>Nom</Text>
                        <TextInput style={styles.input} value={user?.lastname} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text>Nationalité</Text>
                        <TextInput style={styles.input} value={user?.nationality ?? undefined} />
                    </View>

                    <View style={styles.column}>
                        <Text>Date de naissance</Text>
                        <TextInput style={styles.input} value={user?.birthdate ? new Date(user.birthdate).toLocaleDateString() : ""} />
                    </View>
                </View>
                <View>
                    <Text>Email</Text>
                    <TextInput style={styles.input} value={user?.email} />
                </View>
                <View style={styles.textArea}>
                    <Text>Bio</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={4} value={user?.bio ?? undefined} />
                </View>
                {isFriend && <Button title="Supprimer en ami" onPress={() => removeFriendMutation()} />}
                {!isFriend && !isSentFriendRequest && !isPendingFriendRequest && <Button title="Ajouter en ami" onPress={() => sendFriendRequestMutation()} />}
                {isSentFriendRequest && <Button title="Annuler la demande d'ami" onPress={() => cancelFriendRequestMutation()} />}
                {isPendingFriendRequest && <Button title="Accepter la demande d'ami" onPress={() => acceptFriendRequestMutation()} />}
                {isSendingFriendRequest || isCancellingFriendRequest || isAcceptingFriendRequest || (isRemovingFriend && <ActivityIndicator size="small" color="#0000ff" />)}
            </ThemedView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        justifyContent: "center",
        padding: 16,
        gap: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginTop: "10%",
        marginBottom: "5%",
    },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    column: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "45%",
    },
    textArea: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "red",
    },
    header: {
        paddingHorizontal: 16,
        zIndex: 1,
    },
    backButton: {
        fontSize: 16,
        color: "#0000ff",
    },
})
