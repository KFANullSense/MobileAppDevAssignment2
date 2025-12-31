import * as Location from 'expo-location';
import { EventProps } from './PostComponents';

export function ConvertDateTimeForSQL(inputDate: Date) {
    //get month returns one less, add one to be correct (not sure why only month does this and not the others? oh well)
    return inputDate.getFullYear() + "-" + (inputDate.getMonth() + 1) + "-" + inputDate.getDate() + " " + inputDate.getHours() + ":" + inputDate.getMinutes();
}

export async function GetCurrentLocationForSQL(): Promise<string> {
    console.log("Attempting to get location");

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status != 'granted') {
        console.error("Permission to use location was denied");
        return "";
    }

    const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.High});
    const returnString: string = "(" + location.coords.longitude + "," + location.coords.latitude + ")";
    return returnString;
}

export function ConvertEventListToProps(inputData: Array<JSON>) {
    var PropList: EventProps[] = [];

    console.log(inputData);

    inputData.map(localEvent => {
        PropList.push({eventName: localEvent.event_name, eventDescription: localEvent.event_description, startTime: localEvent.event_starttime, endTime: localEvent.event_endtime});
    })

    console.log(PropList);

    return PropList;
}