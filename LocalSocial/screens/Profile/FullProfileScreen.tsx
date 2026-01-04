import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/Colours";
import { ReturnUserDetails } from "@/custom_modules/DBConnect";
import { ConvertProfileDetailsToProps, RetrieveRecentPostsByUser, RetrieveRecentPostsForUser } from "@/custom_modules/HelperFunctions";
import { HomePostHolderProps, HomePostRoot } from "@/custom_modules/PostComponents";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export type ProfileProps = {
    profileID: number;
    username: string;
    profilePictureURL: string;
    userStatus: string;
}

export function FullProfileScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const localProfileID = params.userID;

    const [profileData, setProfileData] = useState<ProfileProps>();

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const localProfileData = await ReturnUserDetails({userID: localProfileID});
            
            if (localProfileData) {
                const localProfileProps = ConvertProfileDetailsToProps(localProfileData);
                setProfileData(localProfileProps);
            }
        }

        fetchData();

        return () => {

        }
    }, []));

    return (
        
    )
}

export function ProfilePosts(props: GlobalUserIDProps) {
    const [holderData, setHolderData] = useState<HomePostHolderProps[]>([]);

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const localHolderData = await RetrieveRecentPostsByUser(props.userID);
            
            if (localHolderData) {
                setHolderData(localHolderData);
            }
        }

        fetchData();

        return () => {

        }
    }, []));

    if (holderData.length==0) {
        return (
            <View style={styles.container}>
                <Text>User hasn't made any posts yet!</Text>
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <ScrollView>
                    <HomePostRoot holderList={holderData}/>
                </ScrollView>
            </View>
        )
    }
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