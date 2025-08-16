import { logout } from "@/api/auth"
import { getProfile } from "@/api/user"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
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
        <ThemedView style={styles.container}>
            <Image source={{ uri: data?.avatar ?? "" }} style={styles.avatar} />
            <TouchableOpacity
                onPress={() => {
                    logout()
                    router.replace("/login")
                }}
                style={styles.logoutButton}
            >
                <IconSymbol name="power" size={20} color="red" />
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
            <ScrollView style={styles.scrollView}>
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

                <View style={styles.divider} />
                <View style={styles.supportSection}>
                    <Text style={styles.sectionTitle}>Support & Aide</Text>
                    <TouchableOpacity style={styles.bugReportButton} onPress={() => router.push("/bug-report")}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF9500" />
                        <Text style={styles.bugReportButtonText}>🐛 Signaler un problème</Text>
                        <IconSymbol name="chevron.right" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: "#fff",
        paddingTop: 25,
        marginBottom: 100,
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
        marginTop: "15%",
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
        position: "absolute",
        top: 60,
        left: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logoutButtonText: {
        color: "red",
        fontSize: 10,
        fontWeight: "bold",
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
    supportSection: {
        width: "100%",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        color: "#333",
    },
    bugReportButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    bugReportButtonText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
})
