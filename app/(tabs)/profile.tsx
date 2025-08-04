import { logout } from "@/api/auth"
import { getProfile } from "@/api/user"
import { ThemedView } from "@/components/ThemedView"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CountryPicker, { CountryCode } from "react-native-country-picker-modal"

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
        <ScrollView style={styles.scrollView}>
            <ThemedView style={styles.container}>
                <Image source={{ uri: data?.avatar ?? "" }} style={styles.avatar} />
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text>Prénom</Text>
                        <TextInput style={styles.input} value={data?.firstname} editable={false} />
                    </View>
                    <View style={styles.column}>
                        <Text>Nom</Text>
                        <TextInput style={styles.input} value={data?.lastname} editable={false} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text>Nationalité</Text>
                        <View style={[styles.input, { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 }]}>
                            <CountryPicker
                                {...{
                                    countryCode: data?.nationality as CountryCode,
                                    withFilter: true,
                                    withFlag: true,
                                    withCountryNameButton: true,
                                    withAlphaFilter: false,
                                    withCallingCode: false,
                                    withCurrencyButton: false,
                                    withEmoji: true,
                                }}
                                visible={false}
                                withFlagButton={!!data?.nationality}
                                disableNativeModal={true}
                            />
                        </View>
                    </View>

                    <View style={styles.column}>
                        <Text>Date de naissance</Text>
                        <TextInput style={styles.input} value={data?.birthdate ? new Date(data.birthdate).toLocaleDateString() : ""} editable={false} />
                    </View>
                </View>
                <View style={[styles.column, { width: "100%" }]}>
                    <Text>Email</Text>
                    <TextInput style={styles.input} value={data?.email} editable={false} />
                </View>
                <View style={styles.textArea}>
                    <Text>Bio</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={4} value={data?.bio ?? undefined} editable={false} />
                </View>
                <View style={styles.divider} />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.friendsButton} onPress={() => router.push(`/modal?type=friends`)}>
                        <Text style={styles.friendsButtonText}>Mes amis</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.friendsButton} onPress={() => router.push(`/modal?type=my-events`)}>
                        <Text style={styles.friendsButtonText}>Mes évènements</Text>
                    </TouchableOpacity>
                </View>
                <Button
                    title="Déconnexion"
                    onPress={() => {
                        logout()
                        router.replace("/login")
                    }}
                    color="red"
                />
            </ThemedView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 25,
        marginBottom: 80,
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
    friendsButton: {
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 10,
        width: "45%",
        alignItems: "center",
    },
    friendsButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    logoutButton: {
        marginTop: 20,
    },
    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 5,
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        width: "100%",
        marginBottom: 20,
    },
})
