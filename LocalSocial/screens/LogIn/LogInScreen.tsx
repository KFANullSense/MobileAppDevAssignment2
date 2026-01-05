import { BackgroundColour, ButtonColour } from '@/custom_modules/CustomStyles';
import { CreateUser, LogInToUser } from '@/custom_modules/DBConnect';
import React, { useState } from 'react';
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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>
            <Header/>
            <View style={styles.loginContainer}>
                <TextInput style={styles.loginTextbox} placeholder="Username" onChangeText={(value) => setUsername(value)} autoCapitalize='none'/>
                <TextInput style={styles.loginTextbox} placeholder="Password" onChangeText={(value) => setPassword(value)} secureTextEntry={true} autoCapitalize='none'/>
                <Pressable style={styles.loginButton} onPress={async () => {props.updateIDFunc(await LogInToUser({username: username, password: password}))}}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                </Pressable>
                <Pressable style={styles.loginButton} onPress={async() => {props.updateIDFunc(await CreateUser({username: username, password:password}))}}>
                    <Text style={styles.loginButtonText}>Register</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        justifyContent:'center'
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20
    },
    loginContainer: {
        alignItems: 'center',
    },
    loginTextbox: {
        backgroundColor: '#ffffff',
        width: '80%',
        margin:5,
        padding:15,
        fontSize:18
    },
    loginButton: {
        backgroundColor: ButtonColour,
        alignItems: 'center',
        justifyContent:'center',
        margin:5,
        borderRadius:10,
        padding:20
    },

    loginButtonText: {
        fontSize:20
    }
})