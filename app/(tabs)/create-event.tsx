import { EventRequest, EventStatus, EventType, createEvent, getEvent, updateEvent } from "@/api/event"
import { getProfile } from "@/api/user"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { router, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Toast } from "toastify-react-native"
import * as yup from "yup"

interface FormData {
    title: string
    description: string
    type: EventType
    startDate: Date
    endDate: Date
    address: Address
    coverImage: string
}

const schema = yup.object().shape({
    title: yup.string().required("Le titre est requis"),
    description: yup.string().required("La description est requise"),
    type: yup.mixed<EventType>().oneOf(Object.values(EventType)).required("Le type est requis"),
    startDate: yup.date().required("La date de début est requise"),
    endDate: yup.date().required("La date de fin est requise").min(yup.ref("startDate"), "La date de fin doit être après la date de début"),
    address: yup.object().shape({
        number: yup.string().required(),
        street: yup.string().required(),
        city: yup.string().required(),
        postal_code: yup.string().required(),
        country: yup.string().required(),
        latitude: yup.number().required(),
        longitude: yup.number().required(),
    }),
    coverImage: yup.string().required("L'image de couverture est requise"),
})

export default function CreateEventScreen() {
    const { type, id } = useLocalSearchParams<{ type: "create" | "update"; id: string }>()
    const { showActionSheetWithOptions } = useActionSheet()
    const queryClient = useQueryClient()
    const [addressQuery, setAddressQuery] = useState<string>("")
    const [addressSuggestions, setAddressSuggestions] = useState<
        { label: string; street: string; city: string; postalCode: string; country: string; latitude: number; longitude: number }[] | null
    >(null)
    const [addressSelected, setAddressSelected] = useState<{
        label: string
        street: string
        city: string
        postalCode: string
        country: string
        latitude: number
        longitude: number
    } | null>(null)
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

    const { data: event } = useQuery({
        queryKey: ["event", id],
        queryFn: () => getEvent(id),
        enabled: type === "update" && !!id,
    })

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: type === "update" ? event?.title : "",
            description: type === "update" ? event?.description : "",
            type: type === "update" ? event?.type : EventType.OTHER,
            startDate: type === "update" ? new Date(event?.startDate!) : new Date(),
            endDate: type === "update" ? new Date(event?.endDate!) : new Date(),
            coverImage: type === "update" ? event?.coverImage : "",
            address: {
                number: type === "update" ? event?.address.number : "",
                street: type === "update" ? event?.address.street : "",
                city: type === "update" ? event?.address.city : "",
                postal_code: type === "update" ? event?.address.postal_code : "",
                country: type === "update" ? event?.address.country : "",
                latitude: type === "update" ? event?.address.latitude : 0,
                longitude: type === "update" ? event?.address.longitude : 0,
            },
        },
    })

    useEffect(() => {
        ;(async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Toast.error("Permission de localisation refusée")
                return
            }

            try {
                const location = await Location.getCurrentPositionAsync({})
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                })
            } catch {
                Toast.error("Erreur lors de la récupération de la position")
            }
        })()
    }, [])

    useEffect(() => {
        const fetchAddressSuggestions = async () => {
            if (addressQuery.length < 3) {
                setAddressSuggestions(null)
                return
            }

            setIsLoadingSuggestions(true)
            try {
                fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressQuery)}&limit=5&lat=${userLocation?.latitude}&lon=${userLocation?.longitude}`)
                    .then((res) => res.json())
                    .then(
                        (data: { features: { properties: { label: string; name?: string; city?: string; postcode?: string }; geometry: { coordinates: [number, number] } }[] }) => {
                            setAddressSuggestions(
                                data.features.map((f) => ({
                                    label: f.properties.label,
                                    street: f.properties.name || "",
                                    city: f.properties.city || "",
                                    postalCode: f.properties.postcode || "",
                                    country: "France",
                                    latitude: f.geometry.coordinates[1],
                                    longitude: f.geometry.coordinates[0],
                                }))
                            )
                        }
                    )
                    .catch(() => {})
            } catch {
                Toast.error("Erreur lors de la récupération des suggestions")
            } finally {
                setIsLoadingSuggestions(false)
            }
        }

        const debounceTimer = setTimeout(fetchAddressSuggestions, 300)
        return () => clearTimeout(debounceTimer)
    }, [addressQuery, userLocation])

    useEffect(() => {
        if (event && type === "update") {
            setAddressQuery(`${event.address.number} ${event.address.street}, ${event.address.postal_code} ${event.address.city}, ${event.address.country}`)
        }
    }, [event, type])

    // Fonction pour calculer la distance entre deux points (formule de Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371 // Rayon de la Terre en km
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    const toRad = (value: number) => {
        return (value * Math.PI) / 180
    }

    const handleAddressSelect = (suggestion: { label: string; street: string; city: string; postalCode: string; country: string; latitude: number; longitude: number }) => {
        setAddressSelected(suggestion)
        setValue("address", {
            number: suggestion.street.split(" ")[0],
            street: suggestion.street.split(" ").slice(1).join(" "),
            city: suggestion.city,
            postal_code: suggestion.postalCode,
            country: suggestion.country,
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
        })
        setAddressQuery(suggestion.label)
        setShowSuggestions(false)
    }

    const { mutate: createEventMutation, isPending } = useMutation({
        mutationFn: (event: EventRequest) => createEvent(event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
            reset()
            router.back()
            Toast.success("L'événement a été créé avec succès !")
        },
    })

    const { mutate: updateEventMutation, isPending: isUpdating } = useMutation({
        mutationFn: (event: EventRequest) => updateEvent(id, event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
            reset()
            router.back()
            Toast.success("L'événement a été modifié avec succès !")
        },
    })

    const onSubmit = async (data: FormData) => {
        try {
            const user = await getProfile()
            const newEvent: EventRequest = {
                title: data.title,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                type: data.type,
                address: data.address,
                status: EventStatus.PENDING,
                slug: data.title.toLowerCase().replace(/\s+/g, "-"),
                ownerId: user.id,
                coverImage: data.coverImage,
            }

            if (type === "update") {
                updateEventMutation(newEvent)
                reset({
                    title: "",
                    description: "",
                    type: EventType.OTHER,
                    startDate: new Date(),
                    endDate: new Date(),
                    coverImage: "",
                    address: {
                        number: "",
                        street: "",
                        city: "",
                        postal_code: "",
                        country: "",
                        latitude: 0,
                        longitude: 0,
                    },
                })
                setAddressQuery("")
                setAddressSelected(null)
            } else {
                createEventMutation(newEvent)
                reset({
                    title: "",
                    description: "",
                    type: EventType.OTHER,
                    startDate: new Date(),
                    endDate: new Date(),
                    coverImage: "",
                    address: {
                        number: "",
                        street: "",
                        city: "",
                        postal_code: "",
                        country: "",
                        latitude: 0,
                        longitude: 0,
                    },
                })
                setAddressQuery("")
                setAddressSelected(null)
            }
        } catch {
            Toast.error("Une erreur est survenue lors de la création de l'événement")
        }
    }

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            Toast.error("Désolé, nous avons besoin des permissions pour accéder à vos photos !")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            base64: true,
        })

        if (!result.canceled) {
            setValue("coverImage", `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`)
        }
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()

        if (status !== "granted") {
            Toast.error("Désolé, nous avons besoin des permissions pour accéder à votre caméra !")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            base64: true,
        })

        if (!result.canceled) {
            setValue("coverImage", `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`)
        }
    }

    const showImagePickerOptions = () => {
        showActionSheetWithOptions(
            {
                options: ["Prendre une photo", "Choisir depuis la galerie", "Annuler"],
                cancelButtonIndex: 2,
                title: "Sélectionner une image",
            },
            (selectedIndex) => {
                switch (selectedIndex) {
                    case 0:
                        takePhoto()
                        break
                    case 1:
                        pickImage()
                        break
                }
            }
        )
    }

    const EventTypes = Object.values(EventType).map((type) => {
        if (type === EventType.OTHER) return { label: "Autre", value: type }
        if (type === EventType.MUSIC) return { label: "Musique", value: type }
        if (type === EventType.DANCE) return { label: "Danse", value: type }
        if (type === EventType.THEATRE) return { label: "Théâtre", value: type }
        if (type === EventType.VISUAL_ART) return { label: "Art visuel", value: type }
        if (type === EventType.LITERATURE) return { label: "Littérature", value: type }
        if (type === EventType.CINEMA) return { label: "Cinéma", value: type }
        if (type === EventType.SPORTS) return { label: "Sport", value: type }
        return { label: type, value: type }
    })

    if (!userLocation) {
        return <ActivityIndicator size="large" color="#007AFF" />
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{type === "update" ? "Modifier l'événement" : "Créer un événement"}</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Titre</Text>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, value } }) => (
                            <TextInput style={[styles.input, errors.title && styles.inputError]} value={value} onChangeText={onChange} placeholder="Titre de l'événement" />
                        )}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Description de l'événement"
                                multiline
                                numberOfLines={4}
                            />
                        )}
                    />
                    {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Type d&apos;événement</Text>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => {
                            const selectedType = EventTypes.find((type) => type.value === value)
                            return (
                                <TouchableOpacity
                                    style={[styles.selectContainer, errors.type && styles.inputError]}
                                    onPress={() => {
                                        showActionSheetWithOptions(
                                            {
                                                options: [...EventTypes.map((type) => type.label), "Annuler"],
                                                cancelButtonIndex: EventTypes.length,
                                                title: "Sélectionner un type d'événement",
                                            },
                                            (selectedIndex) => {
                                                if (selectedIndex !== undefined && selectedIndex < EventTypes.length) {
                                                    onChange(EventTypes[selectedIndex].value)
                                                }
                                            }
                                        )
                                    }}
                                >
                                    <Text style={styles.selectText}>{selectedType?.label || "Sélectionner un type"}</Text>
                                </TouchableOpacity>
                            )
                        }}
                    />
                    {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date de début</Text>
                    <Controller
                        control={control}
                        name="startDate"
                        render={({ field: { onChange, value } }) => <DateTimePicker value={value} mode="datetime" onChange={(_, date) => date && onChange(date)} />}
                    />
                    {errors.startDate && <Text style={styles.errorText}>{errors.startDate.message}</Text>}
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date de fin</Text>
                    <Controller
                        control={control}
                        name="endDate"
                        render={({ field: { onChange, value } }) => <DateTimePicker value={value} mode="datetime" onChange={(_, date) => date && onChange(date)} />}
                    />
                    {errors.endDate && <Text style={styles.errorText}>{errors.endDate.message}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Adresse</Text>
                    <View style={styles.addressContainer}>
                        <TextInput
                            style={[styles.input, errors.address && styles.inputError]}
                            value={addressQuery}
                            onChangeText={(text) => {
                                setAddressQuery(text)
                                setShowSuggestions(true)
                            }}
                            placeholder="Adresse de l'événement"
                            onFocus={() => setShowSuggestions(true)}

                            // onKeyPress={(e) => {
                            //     if (e.nativeEvent.key === "Backspace") {
                            //         e.preventDefault()
                            //         e.stopPropagation()
                            //         setShowSuggestions(false)
                            //         setAddressQuery("")
                            //         setAddressSelected(null)
                            //         setValue("address", {
                            //             number: "",
                            //             street: "",
                            //             city: "",
                            //             postal_code: "",
                            //             country: "",
                            //             latitude: 0,
                            //             longitude: 0,
                            //         })
                            //     }
                            // }}
                        />
                        {isLoadingSuggestions && (
                            <View style={styles.suggestionsLoading}>
                                <ActivityIndicator size="small" color="#007AFF" />
                            </View>
                        )}
                        {showSuggestions && addressSuggestions && addressSuggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                {!addressSelected &&
                                    addressSuggestions.map(
                                        (suggestion, index) =>
                                            index < 4 && (
                                                <TouchableOpacity style={styles.suggestionItem} onPress={() => handleAddressSelect(suggestion)} key={suggestion.label}>
                                                    <View style={styles.suggestionContent}>
                                                        <Text style={styles.suggestionText}>{suggestion.label}</Text>
                                                        {userLocation && (
                                                            <Text style={styles.distanceText}>
                                                                {Math.round(
                                                                    calculateDistance(userLocation.latitude, userLocation.longitude, suggestion.latitude, suggestion.longitude) *
                                                                        1000
                                                                )}{" "}
                                                                m
                                                            </Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                    )}
                            </View>
                        )}
                    </View>
                    {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Image de couverture</Text>
                    <Controller
                        control={control}
                        name="coverImage"
                        render={({ field: { value } }) => (
                            <TouchableOpacity style={styles.imagePickerContainer} onPress={showImagePickerOptions}>
                                {value ? (
                                    <Image source={{ uri: value }} style={styles.coverImage} />
                                ) : (
                                    <View style={styles.placeholderContainer}>
                                        <Text style={styles.placeholderText}>Appuyez pour sélectionner une image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                    />
                    {errors.coverImage && <Text style={styles.errorText}>{errors.coverImage.message}</Text>}
                </View>

                <TouchableOpacity style={[styles.submitButton, isPending && styles.submitButtonDisabled]} onPress={handleSubmit(onSubmit)} disabled={isPending}>
                    {isPending || isUpdating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>{type === "update" ? "Modifier l'événement" : "Créer l'événement"}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 75,
    },
    title: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: "#333",
    },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    inputError: {
        borderWidth: 1,
        borderColor: "#ff3b30",
    },
    errorText: {
        color: "#ff3b30",
        fontSize: 14,
        marginTop: -10,
        marginBottom: 10,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    selectContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    selectText: {
        fontSize: 16,
        color: "#333",
    },
    submitButton: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    imagePickerContainer: {
        width: "100%",
        height: 200,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 15,
    },
    coverImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    placeholderText: {
        color: "#666",
        textAlign: "center",
        fontSize: 16,
    },
    addressContainer: {
        position: "relative",
        zIndex: 1,
    },
    suggestionsContainer: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginTop: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    suggestionContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    suggestionText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    distanceText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 10,
    },
    suggestionsLoading: {
        position: "absolute",
        right: 15,
        top: 15,
    },
})
