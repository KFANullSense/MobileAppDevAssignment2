import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour } from "@/custom_modules/Colours";
import { GetPostsFromEvent, ReturnFullEvent } from "@/custom_modules/DBConnect";
import { CheckDistance, ConvertEventDetailsToProp, ConvertPostListToProps, ConvertSQLCoordsToNumber, GetCurrentLocationCoords, LocationHolder } from "@/custom_modules/HelperFunctions";
import { PostHolder, PostProps } from "@/custom_modules/PostComponents";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type HeaderProps = {
    eventName: string;
}

function Header(props: HeaderProps) {
    return (
        <View>
            <Text style={styles.header}>{props.eventName}</Text>
        </View>
    );
}

export default function EventPostsScreen(props: GlobalUserIDProps) {
    const [localEventName, setEventName] = useState("");
    const [componentList, setComponentList] = useState<PostProps[]>([]);
    const [localUserLocation, setLocalUserLocation] = useState<LocationHolder>({latitude: 0, longitude: 0});
    const [withinRange, setWithinRange] = useState(false);

    const params = useRoute().params;
    const localEventID = params.eventID;

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

            const currLocation = await GetCurrentLocationCoords();
            setLocalUserLocation(currLocation);
            const rangeCheck = CheckDistance({startLocation: currLocation, endLocation: ConvertSQLCoordsToNumber(eventDataProp.eventLocation)});
            setWithinRange(rangeCheck);
        }

        fetchInfo();

        return () => {

        }
    }, []));

    return (
        <View style={styles.container}>
            <Header eventName={localEventName}/>
            <ScrollView style={styles.postContainer}>
                <PostHolder postList={componentList} userLocation={localUserLocation}/>
            </ScrollView>
            <PostButtonComponent EventID={localEventID} WithinRange={withinRange}/>
        </View>
    )
}

type PostButtonProps = {
    EventID: number;
    WithinRange: boolean;
}

function PostButtonComponent(props: PostButtonProps) {
    const navigation = useNavigation();

    if (props.WithinRange) {
        return (
            <View style={styles.floatingContainer}>
                <Pressable style={styles.createPostButton} onPress={() => navigation.navigate("Create Post", {eventID: props.EventID})}>
                    <FontAwesome5 name="plus" size={30}/>
                </Pressable>
            </View>
        )
    } else {
        return (
            <View style={styles.floatingContainer}>
                <View style= {styles.tooFarButton}>
                    <FontAwesome name="remove" size={30}/>
                </View>
            </View>    
        )
    }
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
        alignItems:'center',
        justifyContent:'center'
    },

    tooFarButton: {
        backgroundColor: '#687a80ff',
        width: 75,
        height: 75,
        borderRadius: 50,
        alignItems:'center',
        justifyContent:'center'
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