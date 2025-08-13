import BugReportForm from "@/components/BugReportForm"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { router } from "expo-router"
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native"

export default function BugReportPage() {
    const handleSuccess = () => {
        router.back()
    }

    const handleCancel = () => {
        router.back()
    }

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.container}>
                {/* Header avec bouton retour */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color="#007AFF" />
                        <ThemedText style={styles.backText}>Retour</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Formulaire de signalement */}
                <BugReportForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </ThemedView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        marginLeft: 5,
        fontSize: 17,
        color: "#007AFF",
    },
})
