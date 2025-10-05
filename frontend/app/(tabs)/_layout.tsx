import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
      }}>
      <Tabs.Screen
        name="home" 
        options={{ title: 'Início', tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="search" 
        options={{ title: 'Buscar', tabBarIcon: ({ color }) => <Ionicons name="search" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="watched" 
        options={{ title: 'Assistidos', tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="wishlist" 
        options={{ title: 'Desejos', tabBarIcon: ({ color }) => <Ionicons name="bookmark" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="profile" 
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} /> }}
      />
    </Tabs>
  );
}