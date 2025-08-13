import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import { useEffect, useState } from "react"
import { Toast } from "toastify-react-native"

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null)
    const [lastLocationStored, setLastLocationStored] = useState<Location.LocationObjectCoords | null>(null)

    useEffect(() => {
        ;(async () => {
            let { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Toast.error("Permission de localisation refusée")
                return
            }

            let location = await Location.getCurrentPositionAsync()
            await AsyncStorage.setItem("lastLocation", JSON.stringify(location.coords))
            setLocation(location.coords)
        })()
        ;(async () => {
            const lastLocation = await AsyncStorage.getItem("lastLocation")
            if (lastLocation) {
                setLastLocationStored(JSON.parse(lastLocation))
            }
        })()
    }, [])

    return { location, lastLocationStored }
}
