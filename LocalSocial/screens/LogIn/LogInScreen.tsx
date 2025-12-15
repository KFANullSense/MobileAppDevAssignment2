import { CreateUser } from '@/components/DBConnect';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from "react-native";

function Header() {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>Log In / Register</Text>
        </View>
    );
}


async function PrintDBResults() {
    // const { data } = await supabase.rpc('createuser', {username_input: "testuserfromreact", password_input:"testpw"});
    // console.log(data);

    CreateUser({username:"testuserreact_newbutagain", password:"testpw"});
}

export default function LogInScreen() {
    //PrintDBResults();

    const [username, onChangeUsername] = React.useState('');
    const [password, onChangePassword] = React.useState('');
    
    return (
        <View style={styles.container}>
            <Header/>
            <View style={styles.loginContainer}>
                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={onChangeUsername}>

                </TextInput>
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={onChangePassword}>

                </TextInput>
            </View>
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
    },
    loginContainer: {
        backgroundColor: '#b6dee5ff'
    },
    input: {
        height: 49,
        margin: 12,
        borderWidth: 1,
        padding: 10
    }
})