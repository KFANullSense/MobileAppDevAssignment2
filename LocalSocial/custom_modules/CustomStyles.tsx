import { StyleSheet } from "react-native";

export const BackgroundColour = '#b6dee5ff';
export const HolderColour = '#50bbc9ff';
export const HolderColourDark = '#3694a0ff';
export const HolderColourLight = '#54d0e0ff';
export const ButtonColour = '#45b6fe';

export const editButtonStyles = StyleSheet.create({
    editRow: {
        flexDirection:'row',
        alignItems:'center',
    },
    editButton: {
        marginLeft:5,
        marginTop:0,
        backgroundColor:ButtonColour,
        borderRadius:10,
        padding:5
    },
    modalButton: {
        backgroundColor:ButtonColour,
        padding:10,
        alignItems:'center',
        margin:5,
        borderRadius:10
    },
    modalContainer: {
        justifyContent:'center',
        alignItems:'center',
        flex:1
    },
    modalView: {
        backgroundColor:HolderColourLight,
        padding:20,
        width:'75%',
        borderColor:'black',
        borderWidth:2,
        borderRadius:10
    },
    modalTextInput: {
        backgroundColor:'#ffffff',
        margin:10
    }
})