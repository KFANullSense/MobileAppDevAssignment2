import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/Colours";
import { StyleSheet, View } from "react-native";

export default function MyProfileScreen(props: GlobalUserIDProps) {
    return (
        <View style={styles.container}></View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        alignItems: 'center',
        justifyContent: 'center'
    }
})