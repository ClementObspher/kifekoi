import { Tabs } from "expo-router"
import React from "react"
import { Platform, Text, View } from "react-native"

import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"

const ColoredLabel = ({ text, colors }: { text: string; colors: string[] }) => {
    return (
        <View style={{ flexDirection: "row" }}>
            {text.split("").map((letter, index) => (
                <Text
                    key={index}
                    style={{
                        color: colors[index % colors.length],
                        fontSize: 10,
                        fontWeight: "500",
                    }}
                >
                    {letter}
                </Text>
            ))}
        </View>
    )
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#007AFF",
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: "absolute",
                    },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Home" colors={focused ? ["#007AFF"] : ["#666"]} />,
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: "Événements",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Événements" colors={focused ? ["#007AFF"] : ["#666"]} />,
                }}
            />
            <Tabs.Screen
                name="create-event"
                options={{
                    title: "Créer",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Créer" colors={focused ? ["#007AFF"] : ["#666"]} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Profile" colors={focused ? ["#007AFF"] : ["#666"]} />,
                }}
            />
        </Tabs>
    )
}
