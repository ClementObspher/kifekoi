import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native"

const COLORS = ["#fb5d18", "#fba30b", "#4abb45", "#3a35db", "#1487ea"]

// Composant pour colorer chaque lettre individuellement
const ColoredLabel = ({ text, style, textStyle }: { text: string; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) => {
    return (
        <View style={[style, { flexDirection: "row" }]}>
            {text.split("").map((letter, index) => (
                <Text key={index} style={[{ color: COLORS[index % COLORS.length], fontSize: 10, fontWeight: "500" }, textStyle]}>
                    {letter}
                </Text>
            ))}
        </View>
    )
}

export default ColoredLabel
