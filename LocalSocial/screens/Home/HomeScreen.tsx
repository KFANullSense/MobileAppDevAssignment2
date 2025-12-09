import { PostHolder } from '@/components/PostComponents';
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
                <PostHolder/>
                <PostHolder/>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#b6dee5ff',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20
    }
})