import BrowseScreen from '@/screens/Browse/BrowseScreen';
import FriendsScreen from '@/screens/Friends/FriendsScreen';
import HomeScreen from "@/screens/Home/HomeScreen";
import MyEventsScreen from '@/screens/MyEvents/MyEventsScreen';
import MyProfileScreen from '@/screens/Profile/MyProfileScreen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const TabNav = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      <Tab.Screen
      name = "Profile"
      component = {MyProfileScreen}
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
      name = "Friends"
      component = {FriendsScreen}
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
      component = {HomeScreen}
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
      component = {MyEventsScreen}
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
      component = {BrowseScreen}
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
  return (
    <TabNav/>
  );
}