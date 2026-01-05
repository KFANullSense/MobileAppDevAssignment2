import BrowseScreen from '@/screens/Browse/BrowseScreen';
import FriendsScreen from '@/screens/Friends/FriendsScreen';
import HomeScreen from "@/screens/Home/HomeScreen";
import LogInScreen from '@/screens/LogIn/LogInScreen';
import MyEventsScreen from '@/screens/MyEvents/MyEventsScreen';
import MyProfileScreen from '@/screens/Profile/MyProfileScreen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useState } from 'react';

export type GlobalUserIDProps = {
  userID: number;
}

const TabNav = (props: GlobalUserIDProps) => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <Tab.Screen
      name = "Profile"
      children = {() => <MyProfileScreen userID={props.userID}/>}
      options = {{
        tabBarIcon: ({color, size}) => (
          <FontAwesome
            name="user"
            color={color}
            size={size}/>
        )
      }}
      />
      <Tab.Screen
      name = "Community"
      children = {() => <FriendsScreen userID={props.userID}/>}
      options = {{
        tabBarIcon: ({color, size}) => (
          <FontAwesome
            name="users"
            color={color}
            size={size}/>
        )
      }}
      />
      <Tab.Screen
      name = "Home"
      children = {() => <HomeScreen userID={props.userID}/>}
      options = {{
        tabBarIcon: ({color, size}) => (
          <MaterialCommunityIcons
            name="home"
            color={color}
            size={size}/>
        )
      }}
      />
      <Tab.Screen
      name = "My Events"
      children = {() => <MyEventsScreen userID={props.userID}/>}
      options = {{
        tabBarIcon: ({color, size}) => (
          <FontAwesome5
            name="folder-open"
            color={color}
            size={size}/>
        )
      }}
      />
      <Tab.Screen
      name = "Browse"
      children = {() => <BrowseScreen userID={props.userID}/>}
      options = {{
        tabBarIcon: ({color, size}) => (
          <FontAwesome5
            name="map-marker-alt"
            color={color}
            size={size}/>
        )
      }}
      />
      
    </Tab.Navigator>
  )
}

export default function App() {
  const [localUserID, setLocalUserID] = useState(-1);

  function updateUserID(newUserID: number) {
    setLocalUserID(newUserID);
  }

  if (localUserID == -1) {
    return (
      <LogInScreen updateIDFunc={updateUserID}/>
    );
  } else {
    return (
      <TabNav userID={localUserID}/>
    );
  }
}