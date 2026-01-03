import * as Location from 'expo-location';
import { GetJoinedEvents, GetRecentPostsFromEvent, ReturnUserDetails } from './DBConnect';
import { CommentProps, EventProps, HomePostHolderProps, PostProps } from './PostComponents';

export function ConvertDateTimeForSQL(inputDate: Date) {
    //get month returns one less, add one to be correct (not sure why only month does this and not the others? oh well)
    return inputDate.getFullYear() + "-" + (inputDate.getMonth() + 1) + "-" + inputDate.getDate() + " " + inputDate.getHours() + ":" + inputDate.getMinutes();
}

export type LocationHolder = {
    latitude: number;
    longitude: number;
}

export async function GetCurrentLocationCoords(): Promise<LocationHolder | null> {
    console.log("Attempting to get location");

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status != 'granted') {
        console.error("Permission to use location was denied");
        return null;
    }

    const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.High});
    return {latitude: location.coords.latitude, longitude: location.coords.longitude}
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
        propList.push({eventName: localEvent.event_name, eventDescription: localEvent.event_description, startTime: localEvent.event_starttime, endTime: localEvent.event_endtime, eventID: localEvent.event_id, eventLocation: localEvent.event_location});
    })

    return propList;
}

export function ConvertEventDetailsToProp(inputData: Array<JSON>) {
    const eventJSON: JSON = inputData[0];

    const returnProp: EventProps = {eventName: eventJSON.event_name, eventDescription: eventJSON.event_description, startTime: eventJSON.event_starttime, endTime: eventJSON.event_endtime, eventID: eventJSON.event_id, eventLocation: eventJSON.event_location};

    return returnProp;
}

export async function ConvertPostListToProps(inputData: Array<JSON>) {
    const requests = await Promise.all(inputData.map(async (localPost) => {
        const localPostAuthor = await ReturnUserDetails({userID: localPost.user_id});
        const localPostProps: PostProps = {postTitle: localPost.post_title, postBody: localPost.post_body, postMediaURL: localPost.post_image_url, authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, postID: localPost.post_id, location: localPost.post_location};
        return(localPostProps);
    }));

    return requests;
}

export async function ConvertPostDetailsToProps(inputData: Array<JSON>) {
    const eventJSON: JSON = inputData[0];

    const localPostAuthor = await ReturnUserDetails({userID: eventJSON.user_id});

    const returnProp: PostProps = {postTitle: eventJSON.post_title, postBody: eventJSON.post_body, postMediaURL: eventJSON.post_image_url, authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, postID: eventJSON.post_id, location: eventJSON.post_location};

    return returnProp;
}

export async function ConvertCommentListToProps(inputData: Array<JSON>) {
    const requests = await Promise.all(inputData.map(async (localComment) => {
        const localPostAuthor = await ReturnUserDetails({userID: localComment.user_id});
        const localPostProps: CommentProps = {authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, commentText: localComment.postcomment_text};
        
        return localPostProps;
    }));

    return requests;
}

export async function RetrieveRecentPostsFromUser(localUserID: number) {
    const eventData: Array<JSON> = await GetJoinedEvents({userID: localUserID});

    const requests = await Promise.all(eventData.map(async (localEvent) => {
        const localEventProps = ConvertEventDetailsToProp([localEvent]);
        const localPostData = await GetRecentPostsFromEvent({eventID: localEventProps.eventID});
        const localPostPropsList: PostProps[] = await ConvertPostListToProps(localPostData);
        const localHomePostProps: HomePostHolderProps = {postList: localPostPropsList, eventProps: localEventProps};

        return localHomePostProps;
    }));

    return requests;
}