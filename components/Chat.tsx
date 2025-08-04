import { getEventById } from "@/api/event"
import { addReaction, createMessage, getMessagesByEventId, Message, MessageReaction, MessageReactionType, updateMessage } from "@/api/message"
import CustomInput from "@/components/ui/CustomInput"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useGetToken } from "@/hooks/useGetToken"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Modal from "react-native-modal"

export default function Chat({ eventId }: { eventId: string }) {
    const { decodedToken } = useGetToken()
    const [message, setMessage] = useState("")
    const [updatingMessage, setUpdatingMessage] = useState<Message | null>(null)
    const [updateModaleVisible, setUpdateModaleVisible] = useState(false)
    const [visibleDateMessageId, setVisibleDateMessageId] = useState<string | null>(null)
    const [messageReactions, setMessageReactions] = useState<MessageReaction[]>([])
    const [reactionsModaleVisible, setReactionsModaleVisible] = useState(false)
    const [selectReactionModaleVisible, setSelectReactionModaleVisible] = useState(false)
    const queryClient = useQueryClient()

    const { data: event, isLoading: eventLoading } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => getEventById(eventId),
    })

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ["messages", eventId],
        queryFn: () => getMessagesByEventId(eventId),
    })

    const createMessageMutation = useMutation({
        mutationFn: () => createMessage({ eventId, userId: decodedToken?.userId!, content: message }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", eventId] })
            setMessage("")
        },
    })

    const updateMessageMutation = useMutation({
        mutationFn: (message: Message) => updateMessage(message.id, message.content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", eventId] })
            setUpdateModaleVisible(false)
        },
    })

    const addReactionMutation = useMutation({
        mutationFn: ({ messageId, type }: { messageId: string; type: MessageReactionType }) => addReaction(messageId, decodedToken?.userId!, type),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", eventId] }),
    })

    const handleMessagePress = (message: Message) => {
        setUpdatingMessage(message)
        setUpdateModaleVisible(true)
    }

    const showMessageDate = (messageId: string) => {
        if (visibleDateMessageId === messageId) {
            setVisibleDateMessageId(null)
        } else {
            setVisibleDateMessageId(messageId)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{event?.title}</Text>
                <View style={styles.messagesContainer}>
                    {messagesLoading || eventLoading ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                    ) : messages && messages.length > 0 ? (
                        messages
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((message) => (
                                <View style={styles.messageContainer} key={message.id}>
                                    <View style={message.userId === decodedToken?.userId ? styles.myMessageAvatarContainer : styles.otherMessageAvatarContainer}>
                                        {message.userId !== decodedToken?.userId && <Image source={{ uri: message.user.avatar }} style={styles.messageAvatar} />}
                                        <TouchableOpacity
                                            key={message.id}
                                            style={message.userId === decodedToken?.userId ? styles.myMessage : styles.otherMessage}
                                            onLongPress={() => {
                                                if (message.userId === decodedToken?.userId) {
                                                    handleMessagePress(message)
                                                } else {
                                                    setSelectReactionModaleVisible(true)
                                                    setUpdatingMessage(message)
                                                }
                                            }}
                                            onPress={() => showMessageDate(message.id)}
                                        >
                                            <Text style={message.userId === decodedToken?.userId ? styles.myMessageText : styles.otherMessageText}>{message.content}</Text>
                                            <TouchableOpacity
                                                style={styles.messageReactionsContainer}
                                                onPress={() => {
                                                    setMessageReactions(message.reactions)
                                                    setReactionsModaleVisible(true)
                                                }}
                                            >
                                                {message.reactions.length > 0 && (
                                                    <Text style={styles.messageReaction}>
                                                        {Array.from(new Set(message.reactions.map((reaction) => reaction.type))).map((type) => (
                                                            <Text key={type}>{type === MessageReactionType.LIKE ? "👍" : type === MessageReactionType.DISLIKE ? "👎" : "💖"} </Text>
                                                        ))}
                                                        {message.reactions.length - Array.from(new Set(message.reactions.map((reaction) => reaction.type))).length > 0 && (
                                                            <Text>
                                                                {`+${message.reactions.length - Array.from(new Set(message.reactions.map((reaction) => reaction.type))).length}`}
                                                            </Text>
                                                        )}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                        {message.userId === decodedToken?.userId && <Image source={{ uri: message.user.avatar }} style={styles.messageAvatar} />}
                                    </View>
                                    <View
                                        style={[
                                            message.userId === decodedToken?.userId ? styles.messageDateContainer : styles.otherMessageDateContainer,
                                            { display: visibleDateMessageId === message.id ? "flex" : "none" },
                                        ]}
                                    >
                                        <Text style={styles.messageDate}>{`${new Date(message.createdAt).toLocaleString().split(",")[0]}`}</Text>
                                        <Text style={styles.messageDate}>{`${new Date(message.createdAt).toLocaleString().split(",")[1]}`}</Text>
                                    </View>
                                </View>
                            ))
                    ) : (
                        <View style={styles.emptyMessages}>
                            <Text style={styles.emptyMessagesText}>Aucun message pour l&apos;instant</Text>
                        </View>
                    )}
                </View>
            </View>
            <CustomInput
                iconRight={
                    <TouchableOpacity onPress={() => createMessageMutation.mutate()}>
                        <IconSymbol name="paperplane" size={24} color="#0000ff" />
                    </TouchableOpacity>
                }
                placeholder="Écrivez votre message"
                value={message}
                onChangeText={setMessage}
                containerStyle={styles.messageInputContainer}
            />
            <Modal isVisible={updateModaleVisible} onBackdropPress={() => setUpdateModaleVisible(false)}>
                <View style={styles.updateModale}>
                    <Text>Modifier le message</Text>
                    <CustomInput
                        placeholder="Modifier le message"
                        value={updatingMessage?.content}
                        onChangeText={(text) => setUpdatingMessage({ ...updatingMessage!, content: text })}
                        iconRight={
                            <TouchableOpacity onPress={() => updateMessageMutation.mutate(updatingMessage!)}>
                                <IconSymbol name="paperplane" size={24} color="#0000ff" />
                            </TouchableOpacity>
                        }
                    />
                </View>
            </Modal>
            <Modal isVisible={reactionsModaleVisible} onBackdropPress={() => setReactionsModaleVisible(false)}>
                <View style={styles.updateModale}>
                    <Text>Réactions</Text>
                    <View style={styles.reactionList}>
                        {messageReactions.map((reaction) => (
                            <View style={styles.reactionItem} key={reaction.id}>
                                <View style={styles.reactionItemAvatar}>
                                    <Image source={{ uri: reaction.sender.avatar }} style={styles.reactionAvatar} />
                                    <Text>
                                        {reaction.sender.firstname} {reaction.sender.lastname.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text>{reaction.type === MessageReactionType.LIKE ? "👍" : reaction.type === MessageReactionType.DISLIKE ? "👎" : "💖"}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Modal>
            <Modal isVisible={selectReactionModaleVisible} onBackdropPress={() => setSelectReactionModaleVisible(false)}>
                <View style={styles.updateModale}>
                    <Text>Sélectionner une réaction</Text>
                    <View style={styles.selectReactionList}>
                        {Object.values(MessageReactionType).map((type) => (
                            <TouchableOpacity key={type} onPress={() => addReactionMutation.mutate({ messageId: updatingMessage!.id, type })} style={styles.reactionButton}>
                                <Text>{type === MessageReactionType.LIKE ? "👍" : type === MessageReactionType.DISLIKE ? "👎" : "💖"}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
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
    messageReactionsContainer: {
        position: "absolute",
        bottom: -10,
        right: 10,
        flexDirection: "row",
    },
    messageReaction: {
        backgroundColor: "#e5f5f5",
        padding: 4,
        borderRadius: 10,
        fontSize: 12,
    },
    reactionList: {
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    reactionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "40%",
        gap: 10,
    },
    reactionItemAvatar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    reactionAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    reactionButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
    },
    selectReactionList: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
    },
})
