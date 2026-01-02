import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour } from "@/custom_modules/Colours";
import { GetPostsFromEvent, ReturnFullEvent } from "@/custom_modules/DBConnect";
import { ConvertEventDetailsToProp, ConvertPostListToProps } from "@/custom_modules/HelperFunctions";
import { PostHolder, PostProps } from "@/custom_modules/PostComponents";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type HeaderProps = {
    eventName: string;
}

function Header(props: HeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>{props.eventName}</Text>
        </View>
    );
}

export default function EventPostsScreen(props: GlobalUserIDProps) {
    const [localEventName, setEventName] = useState("");
    const [componentList, setComponentList] = useState<PostProps[]>([]);

    const params = useRoute().params;
    const localEventID = params.eventID;

    const navigation = useNavigation();

    useFocusEffect(useCallback(() => {
        const fetchInfo = async () => {
            const eventData = await ReturnFullEvent({eventID: localEventID});

            const eventDataProp = ConvertEventDetailsToProp(eventData);

            if (eventData) {
                setEventName(eventDataProp.eventName);
            }

            const postData = await GetPostsFromEvent({eventID: localEventID});
            
            if (postData) {
                setComponentList(ConvertPostListToProps(postData));
            }
        }

        fetchInfo();

        return () => {

        }
    }, []));

    return (
        <View style={styles.container}>
            <Header eventName={localEventName}/>
            <ScrollView style={styles.eventHolderContainer}>
                <PostHolder postList={componentList}/>
            </ScrollView>
            <View style={styles.floatingContainer}>
                <Pressable style={styles.createEventButton} onPress={() => navigation.navigate("Create Post")}>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        alignItems: 'center'
    },

    floatingContainer: {
        position: 'absolute',
        bottom:16,
        right:16
    },

    createEventButton: {
        backgroundColor: ButtonColour,
        width: 75,
        height: 75,
        borderRadius: 50,
    },

    eventHolderContainer: {
        width: '90%',
        marginTop:50
    },

    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20
    }
})