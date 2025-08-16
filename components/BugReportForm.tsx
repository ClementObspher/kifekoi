import { BugReport, submitBugReport } from "@/api/bugReport"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import CustomInput from "@/components/ui/CustomInput"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useMutation } from "@tanstack/react-query"
import { modelName } from "expo-device"
import { useEffect } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Toast } from "toastify-react-native"
import { version } from "../package.json"

interface BugReportFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

type FormData = Omit<BugReport, "steps"> & {
    steps: { value: string }[]
}

export default function BugReportForm({ onSuccess, onCancel }: BugReportFormProps) {
    const { showActionSheetWithOptions } = useActionSheet()

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            title: "",
            description: "",
            steps: [{ value: "" }],
            expectedBehavior: "",
            actualBehavior: "",
            priority: "medium",
            category: "other",
            userEmail: "",
            deviceInfo: {
                platform: Platform.OS,
                osVersion: Platform.Version?.toString() || "unknown",
                appVersion: "1.1.1",
                deviceModel: undefined,
            },
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "steps",
    })

    useEffect(() => {
        setValue("deviceInfo", {
            platform: Platform.OS,
            osVersion: Platform.Version?.toString() || "unknown",
            appVersion: version,
            deviceModel: modelName || undefined,
        })
    }, [setValue])

    const formData = watch()

    const submitBugMutation = useMutation({
        mutationFn: (bugReport: BugReport) => submitBugReport(bugReport),
        onSuccess: (result) => {
            if (result.success) {
                Toast.success("🐛 Rapport de bug envoyé avec succès!")
                if (result.issueUrl) {
                    Alert.alert("Bug signalé !", "Votre rapport a été transmis à l'équipe de développement. Voulez-vous voir l'issue créée ?", [
                        { text: "Plus tard", style: "cancel" },
                        { text: "Voir l'issue", onPress: () => Linking.openURL(result.issueUrl!) },
                    ])
                }
                onSuccess?.()
            } else {
                Toast.error(`❌ Erreur: ${result.error}`)
            }
        },
        onError: (error) => {
            console.error("Erreur mutation:", error)
            Toast.error("❌ Erreur lors de l'envoi du rapport")
        },
    })

    const onSubmit = (data: FormData) => {
        const bugReport: BugReport = {
            ...data,
            steps: data.steps.map((step) => step.value),
        }
        submitBugMutation.mutate(bugReport)
    }

    const addStep = () => {
        append({ value: "" })
    }

    const removeStep = (index: number) => {
        remove(index)
    }

    const priorityOptions = [
        { label: "🔹 Faible", value: "low" },
        { label: "🔸 Moyenne", value: "medium" },
        { label: "🔶 Élevée", value: "high" },
        { label: "🔴 Critique", value: "critical" },
    ]

    const categoryOptions = [
        { label: "🎨 Interface utilisateur", value: "ui" },
        { label: "⚡ Performance", value: "performance" },
        { label: "💥 Crash / Bug critique", value: "crash" },
        { label: "✨ Demande de fonctionnalité", value: "feature" },
        { label: "📊 Problème de données", value: "data" },
        { label: "🔧 Autre", value: "other" },
    ]

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#FF9500" />
                    <ThemedText type="title" style={styles.title}>
                        🐛 Signaler un problème
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>Aidez-nous à améliorer l&apos;application en signalant les bugs et dysfonctionnements</ThemedText>
                </View>

                {Object.keys(errors).length > 0 && (
                    <View style={styles.errorContainer}>
                        {Object.entries(errors).map(([key, error]) => (
                            <Text key={key} style={styles.errorText}>
                                • {error?.message || `Erreur dans le champ ${key}`}
                            </Text>
                        ))}
                    </View>
                )}

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="title"
                        rules={{ required: "Le titre est obligatoire" }}
                        render={({ field: { onChange, value } }) => <CustomInput placeholder="Titre du problème *" value={value} onChangeText={onChange} style={styles.input} />}
                    />

                    <Controller
                        control={control}
                        name="description"
                        rules={{ required: "La description est obligatoire" }}
                        render={({ field: { onChange, value } }) => (
                            <CustomInput
                                placeholder="Description détaillée du problème *"
                                value={value}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={4}
                                style={[styles.input, styles.textArea]}
                            />
                        )}
                    />

                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            🔄 Étapes pour reproduire *
                        </ThemedText>
                        {fields.map((field, index) => (
                            <View key={field.id} style={styles.stepContainer}>
                                <Controller
                                    control={control}
                                    name={`steps.${index}.value`}
                                    rules={{ required: "Cette étape est obligatoire" }}
                                    render={({ field: { onChange, value } }) => (
                                        <CustomInput placeholder={`Étape ${index + 1}`} value={value} onChangeText={onChange} style={[styles.input, styles.stepInput]} />
                                    )}
                                />
                                {fields.length > 1 && (
                                    <TouchableOpacity onPress={() => removeStep(index)} style={styles.removeButton}>
                                        <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity onPress={addStep} style={styles.addButton}>
                            <IconSymbol name="plus.circle.fill" size={20} color="#007AFF" />
                            <Text style={styles.addButtonText}>Ajouter une étape</Text>
                        </TouchableOpacity>
                    </View>

                    <Controller
                        control={control}
                        name="expectedBehavior"
                        rules={{ required: "Le comportement attendu est obligatoire" }}
                        render={({ field: { onChange, value } }) => (
                            <CustomInput
                                placeholder="Comportement attendu *"
                                value={value}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={3}
                                style={[styles.input, styles.textArea]}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="actualBehavior"
                        rules={{ required: "Le comportement observé est obligatoire" }}
                        render={({ field: { onChange, value } }) => (
                            <CustomInput
                                placeholder="Comportement observé *"
                                value={value}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={3}
                                style={[styles.input, styles.textArea]}
                            />
                        )}
                    />

                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            🎯 Priorité
                        </ThemedText>
                        <View style={styles.pickerContainer}>
                            <Controller
                                control={control}
                                name="priority"
                                render={({ field: { onChange, value } }) => {
                                    const selectedType = priorityOptions.find((type) => type.value === value)
                                    return (
                                        <TouchableOpacity
                                            style={styles.pickerContainer}
                                            onPress={() => {
                                                showActionSheetWithOptions(
                                                    {
                                                        options: [...priorityOptions.map((type) => type.label), "Annuler"],
                                                        cancelButtonIndex: priorityOptions.length,
                                                        title: "Sélectionner un type d'événement",
                                                    },
                                                    (selectedIndex) => {
                                                        if (selectedIndex !== undefined && selectedIndex < priorityOptions.length) {
                                                            onChange(priorityOptions[selectedIndex].value)
                                                        }
                                                    }
                                                )
                                            }}
                                        >
                                            <Text style={styles.selectText}>{selectedType?.label || "Sélectionner une priorité"}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            📂 Catégorie
                        </ThemedText>
                        <View style={styles.pickerContainer}>
                            <Controller
                                control={control}
                                name="category"
                                render={({ field: { onChange, value } }) => {
                                    const selectedType = categoryOptions.find((type) => type.value === value)
                                    return (
                                        <TouchableOpacity
                                            style={styles.pickerContainer}
                                            onPress={() => {
                                                showActionSheetWithOptions(
                                                    {
                                                        options: [...categoryOptions.map((type) => type.label), "Annuler"],
                                                        cancelButtonIndex: categoryOptions.length,
                                                        title: "Sélectionner un type d'événement",
                                                    },
                                                    (selectedIndex) => {
                                                        if (selectedIndex !== undefined && selectedIndex < categoryOptions.length) {
                                                            onChange(categoryOptions[selectedIndex].value)
                                                        }
                                                    }
                                                )
                                            }}
                                        >
                                            <Text style={styles.selectText}>{selectedType?.label || "Sélectionner une catégorie"}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="userEmail"
                        rules={{
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Format d'email invalide",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <CustomInput placeholder="Votre email (optionnel)" value={value} onChangeText={onChange} keyboardType="email-address" style={styles.input} />
                        )}
                    />

                    <View style={styles.deviceInfo}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            📱 Informations de l&apos;appareil
                        </ThemedText>
                        <ThemedText style={styles.deviceInfoText}>Plateforme: {formData.deviceInfo?.platform}</ThemedText>
                        <ThemedText style={styles.deviceInfoText}>Version OS: {formData.deviceInfo?.osVersion}</ThemedText>
                        <ThemedText style={styles.deviceInfoText}>Version App: {formData.deviceInfo?.appVersion}</ThemedText>
                        {formData.deviceInfo?.deviceModel && <ThemedText style={styles.deviceInfoText}>Modèle: {formData.deviceInfo.deviceModel}</ThemedText>}
                    </View>
                </View>

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSubmit(onSubmit)} style={[styles.button, styles.submitButton]} disabled={submitBugMutation.isPending}>
                        {submitBugMutation.isPending ? <Text style={styles.submitButtonText}>Envoi en cours...</Text> : <Text style={styles.submitButtonText}>🚀 Envoyer</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        marginTop: 10,
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        lineHeight: 22,
    },
    errorContainer: {
        backgroundColor: "#FFF5F5",
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#FF3B30",
        marginBottom: 20,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginBottom: 5,
    },
    form: {
        marginBottom: 30,
    },
    input: {
        marginBottom: 15,
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 10,
        fontSize: 18,
        fontWeight: "600",
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    stepInput: {
        flex: 1,
        marginRight: 10,
        marginBottom: 0,
    },
    removeButton: {
        padding: 5,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#F0F8FF",
        borderRadius: 8,
        marginTop: 5,
    },
    addButtonText: {
        marginLeft: 8,
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "500",
    },
    pickerContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        padding: 10,
    },
    selectText: {
        fontSize: 16,
        color: "#333",
    },
    picker: {
        height: 50,
    },
    deviceInfo: {
        backgroundColor: "#F8F9FA",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    deviceInfoText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: "#F2F2F7",
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        backgroundColor: "#007AFF",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
})
