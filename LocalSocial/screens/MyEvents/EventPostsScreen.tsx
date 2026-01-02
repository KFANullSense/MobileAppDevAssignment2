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
        <View>
            <Text  style={styles.header}>{props.eventName}</Text>
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
            const postData = await GetPostsFromEvent({eventID: localEventID});
            
            if (postData) {
                const propList = await ConvertPostListToProps(postData);
                setComponentList(propList);
            }

            const eventData = await ReturnFullEvent({eventID: localEventID});
            const eventDataProp = ConvertEventDetailsToProp(eventData);

            if (eventData) {
                setEventName(eventDataProp.eventName);
            }
        }

        fetchInfo();

        return () => {

        }
    }, []));

    return (
        <View style={styles.container}>
            <Header eventName={localEventName}/>
            <ScrollView style={styles.postContainer}>
                <PostHolder postList={componentList}/>
            </ScrollView>
            <View style={styles.floatingContainer}>
                <Pressable style={styles.createPostButton} onPress={() => navigation.navigate("Create Post", {eventID: localEventID})}>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        alignItems:'center',
    },

    floatingContainer: {
        position: 'absolute',
        bottom:16,
        right:16
    },

    createPostButton: {
        backgroundColor: ButtonColour,
        width: 75,
        height: 75,
        borderRadius: 50,
    },

    postContainer: {
        width: '90%',
    },

    header: {
        textAlign:'center',
        paddingTop: 20,
        paddingBottom: 20,
        fontSize:36
    }
})