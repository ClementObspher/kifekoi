import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Link, RelativePathString } from "expo-router"
import { StyleSheet, Text, TouchableOpacity } from "react-native"

export const RainbowButton = ({ href, text }: { href: RelativePathString; text: string }) => {
    return (
        <LinearGradient colors={["#fb5d18", "#fba30b", "#4abb45", "#3a35db", "#1487ea"]} style={styles.rainbowContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <BlurView intensity={50} style={styles.messagesButtonContainer}>
                <Link href={href} asChild>
                    <TouchableOpacity style={styles.messagesButton}>
                        <Text style={styles.messagesButtonText}>{text}</Text>
                    </TouchableOpacity>
                </Link>
            </BlurView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    messagesButton: {
        backgroundColor: "transparent",
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
    messagesButtonContainer: {
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
    },
    rainbowContainer: {
        borderRadius: 10,
        overflow: "hidden",
        opacity: 0.9,
    },
})
