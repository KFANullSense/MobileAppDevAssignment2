import { ProfileProps } from '@/screens/Profile/FullProfileScreen';
import * as Location from 'expo-location';
import getDistance from 'geolib/es/getDistance';
import { CheckIfUsersAreMutuallyFollowing, GetJoinedEvents, GetRecentPostsFromEvent, GetRecentPostsFromEventByUser, ReturnUserDetails } from './DBConnect';
import { CommentProps, EventProps, FriendObjectProps, HomePostHolderProps, PostProps } from './PostComponents';

export function ConvertDateTimeForSQL(inputDate: Date) {
    //get month returns one less, add one to be correct (not sure why only month does this and not the others? oh well)
    return inputDate.getFullYear() + "-" + (inputDate.getMonth() + 1) + "-" + inputDate.getDate() + " " + inputDate.getHours() + ":" + inputDate.getMinutes();
}

export type LocationHolder = {
    latitude: number;
    longitude: number;
}

export async function GetCurrentLocationCoords(): Promise<LocationHolder> {
    console.log("Attempting to get location");

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status != 'granted') {
        console.error("Permission to use location was denied");
        return {latitude: 0, longitude: 0};
    }

    const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.High});
    if (location) {
        return {latitude: location.coords.latitude, longitude: location.coords.longitude};
    }

    return {latitude: 0, longitude: 0};
}

export function ConvertCoordsForSQL(inputCoords: LocationHolder) {
    const returnString: string = "(" + inputCoords.latitude + "," + inputCoords.longitude + ")";
    return returnString;
}

export async function GetCurrentLocationForSQL(): Promise<string> {
    console.log("Attempting to get location");

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status != 'granted') {
        console.error("Permission to use location was denied");
        return "";
    }

    const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.High});
    const returnString: string = "(" + location.coords.latitude + "," + location.coords.longitude + ")";
    return returnString;
}

export function ConvertSQLCoordsToNumber(inputString: string): LocationHolder {
    const trimmedString = inputString.replace(/[()]/g, ''); 
    const coordNumbers = trimmedString.split(",");

    return {latitude: Number(coordNumbers[0]), longitude: Number(coordNumbers[1])}
}

export function ConvertEventListToProps(inputData: Array<JSON>) {
    var propList: EventProps[] = [];

    inputData.map(localEvent => {
        propList.push({eventName: localEvent.event_name, eventDescription: localEvent.event_description, startTime: localEvent.event_starttime, endTime: localEvent.event_endtime, eventID: localEvent.event_id, eventLocation: localEvent.event_location, eventImageURL: localEvent.event_image_url});
    })

    return propList;
}

export function ConvertEventDetailsToProp(inputData: Array<JSON>) {
    const eventJSON: JSON = inputData[0];

    const returnProp: EventProps = {eventName: eventJSON.event_name, eventDescription: eventJSON.event_description, startTime: eventJSON.event_starttime, endTime: eventJSON.event_endtime, eventID: eventJSON.event_id, eventLocation: eventJSON.event_location, eventImageURL: eventJSON.event_image_url};

    return returnProp;
}

export async function ConvertPostListToProps(inputData: Array<JSON>) {
    const localUserLocation = await GetCurrentLocationCoords();

    const requests = await Promise.all(inputData.map(async (localPost) => {
        const localPostAuthor = await ReturnUserDetails({userID: localPost.user_id});
        const localPostProps: PostProps = {postTitle: localPost.post_title, postBody: localPost.post_body, postMediaURL: localPost.post_image_url, authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, postID: localPost.post_id, location: localPost.post_location, userLocation: localUserLocation, authorID: localPost.user_id};
        return(localPostProps);
    }));

    return requests;
}

export async function ConvertPostDetailsToProps(inputData: Array<JSON>) {
    const profileJSON: JSON = inputData[0];

    const localUserLocation = await GetCurrentLocationCoords();

    const localPostAuthor = await ReturnUserDetails({userID: profileJSON.user_id});

    const returnProp: PostProps = {postTitle: profileJSON.post_title, postBody: profileJSON.post_body, postMediaURL: profileJSON.post_image_url, authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, postID: profileJSON.post_id, location: profileJSON.post_location, userLocation: localUserLocation, authorID: profileJSON.user_id};

    return returnProp;
}

export async function ConvertCommentListToProps(inputData: Array<JSON>) {
    const requests = await Promise.all(inputData.map(async (localComment) => {
        const localCommentAuthor = await ReturnUserDetails({userID: localComment.user_id});
        const localCommentProps: CommentProps = {authorName: localCommentAuthor[0].username, authorPictureURL: localCommentAuthor[0].profile_picture_url, commentText: localComment.postcomment_text};
        
        return localCommentProps;
    }));

    return requests;
}

export async function RetrieveRecentPostsForUser(localUserID: number) {
    const eventData: Array<JSON> = await GetJoinedEvents({userID: localUserID});

    const localUserLocation = await GetCurrentLocationCoords();

    const requests = await Promise.all(eventData.map(async (localEvent) => {
        const localEventProps = ConvertEventDetailsToProp([localEvent]);
        const localPostData = await GetRecentPostsFromEvent({eventID: localEventProps.eventID});
        const localPostPropsList: PostProps[] = await ConvertPostListToProps(localPostData);
        const localHomePostProps: HomePostHolderProps = {postList: localPostPropsList, eventProps: localEventProps, userLocation: localUserLocation};

        return localHomePostProps;
    }));

    return requests;
}

export async function RetrieveRecentPostsByUser(localUserID: number) {
    const eventData: Array<JSON> = await GetJoinedEvents({userID: localUserID});

    const localUserLocation = await GetCurrentLocationCoords();

    const requests = await Promise.all(eventData.map(async (localEvent) => {
        const localEventProps = ConvertEventDetailsToProp([localEvent]);
        const localPostData = await GetRecentPostsFromEventByUser({eventID: localEventProps.eventID, userID: localUserID});
        if (localPostData.length == 0) {
            return [];
        }

        const localPostPropsList: PostProps[] = await ConvertPostListToProps(localPostData);
        const localHomePostProps: HomePostHolderProps = {postList: localPostPropsList, eventProps: localEventProps, userLocation: localUserLocation};

        return localHomePostProps;
    }));

    return requests;
}

type CheckDistanceProps = {
    startLocation: LocationHolder;
    endLocation: LocationHolder;
}

export function CheckDistance(props: CheckDistanceProps) {
    const maxRange = 500;

    const distance = getDistance({latitude: props.startLocation.latitude, longitude: props.startLocation.longitude}, {latitude: props.endLocation.latitude, longitude: props.endLocation.longitude});
    console.log("Distance to event:", distance);
    
    if (distance > maxRange) {
        console.log("Too far from event, can't interact");
        return false;
    }
    
    console.log("Close enough to event to interact!");
    return true;
}

export function ConvertProfileDetailsToProps(inputData: Array<JSON>) {
    const profileJSON: JSON = inputData[0];

    const returnProp: ProfileProps = {username: profileJSON.username, profilePictureURL: profileJSON.profile_picture_url, userStatus: profileJSON.user_status, profileID: profileJSON.user_id};

    return returnProp;
}

type LocalUserUserListProps = {
    localUser: number;
    userList: Array<JSON>;
}

export async function ConvertUserListToProps(props: LocalUserUserListProps) {
    const requests = await Promise.all(props.userList.map(async (localProfile) => {
        const isMutualVar = await CheckIfUsersAreMutuallyFollowing({localUserID: props.localUser, userToFollowID: localProfile.user_id})

        const localUserProps: FriendObjectProps = {username: localProfile.username, profile_picture_url: localProfile.profile_picture_url, user_status: localProfile.user_status, profileID: localProfile.user_id, isMutual: isMutualVar}

        return localUserProps;
    }));

    return requests;
}