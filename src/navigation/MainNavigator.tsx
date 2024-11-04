import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';

type MainTabParamList = {
  HomeStack: undefined;
  Chats: undefined;
  AddProduct: undefined;
  Profile: undefined;
};

type HomeStackParamList = {
  Home: undefined;
  ProductDetails: { product: any };
  Chat: { userId: string; userName: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <HomeStack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: 'Detalles del Producto' }}
      />
      <HomeStack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({ 
          title: route.params.userName 
        })}
      />
    </HomeStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'AddProduct') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator}
        options={{ 
          title: 'Inicio',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Chats" 
        component={ChatListScreen} 
        options={{ title: 'Mensajes' }}
      />
      <Tab.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ title: 'Publicar' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}