import { BackgroundColour } from "@/custom_modules/Colours";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function Header() {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>Home</Text>
        </View>
    );
}



export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Header/>
            <ScrollView>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20
    }
})