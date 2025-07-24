import { logout } from "@/api/auth"
import { getProfile } from "@/api/user"
import { ThemedView } from "@/components/ThemedView"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { ActivityIndicator, Button, Image, StyleSheet, Text, TextInput } from "react-native"

export default function ProfileScreen() {
    const { data, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    })

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <Image source={{ uri: data?.avatar ?? "" }} style={styles.avatar} />
            <Text>Email</Text>
            <TextInput style={styles.input} value={data?.email} />
            <Text>Name</Text>
            <TextInput style={styles.input} value={data?.name} />
            <Text>Role</Text>
            <TextInput style={styles.input} value={data?.role} />
            <Button
                title="Logout"
                onPress={() => {
                    logout()
                    router.replace("/login")
                }}
            />
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
})
