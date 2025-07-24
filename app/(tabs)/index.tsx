import { getEvents } from "@/api/event"
import { ThemedView } from "@/components/ThemedView"
import { useQuery } from "@tanstack/react-query"
import * as Location from "expo-location"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Dimensions, Image, StyleSheet, Text } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"

export default function HomeScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null)

    const { data: events, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: getEvents,
    })

    useEffect(() => {
        ;(async () => {
            let { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission de localisation refusée")
                return
            }

            let location = await Location.getCurrentPositionAsync({})
            setLocation(location)
        })()
    }, [])

    if (location === null || isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude,
                    longitude: location?.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {events &&
                    events.length > 0 &&
                    events.map((event) => (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.latitude,
                                longitude: event.longitude,
                            }}
                            onCalloutPress={() => router.push(`/event/${event.id}`)}
                        >
                            <Callout style={styles.callout}>
                                <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
                                <Text>{event.title}</Text>
                                <Text>{event.description}</Text>
                            </Callout>
                        </Marker>
                    ))}
            </MapView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    coverImage: {
        width: 200,
        height: 100,
        resizeMode: "cover",
        borderRadius: 16,
    },
    callout: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 8,
    },
})
