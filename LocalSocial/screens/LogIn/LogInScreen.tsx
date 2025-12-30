import { CreateUser, LogInToUser } from '@/components/DBConnect';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

function Header() {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>Log In / Register</Text>
        </View>
    );
}

type LogInScreenProps = {
    updateIDFunc: (newID: number) => void;
}

export default function LogInScreen(props: LogInScreenProps) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return (
        <View style={styles.container}>
            <Header/>
            <View style={styles.loginContainer}>
                <TextInput style={styles.loginTextbox} placeholder="Username" onChangeText={(value) => setUsername(value)}/>
                <TextInput style={styles.loginTextbox} placeholder="Password" onChangeText={(value) => setPassword(value)}/>
                <Pressable style={styles.loginButton} onPress={async () => {props.updateIDFunc(await LogInToUser({username: username, password: password}))}}>
                    <Text>Log In</Text>
                </Pressable>
                <Pressable style={styles.loginButton} onPress={async() => {props.updateIDFunc(await CreateUser({username: username, password:password}))}}>
                    <Text>Register</Text>
                </Pressable>
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
        alignItems: 'center',
    },
    loginTextbox: {
        backgroundColor: '#ffffff',
        width: '80%',
        margin:5
    },
    loginButton: {
        backgroundColor: '#ab9dfaff',
        width: '80%',
        height: 30,
        alignItems: 'center',
        margin:5,
        borderRadius:10
    }
})