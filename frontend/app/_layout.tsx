import { Stack } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false, 
        headerStyle: { backgroundColor: COLORS.background }, 
        headerTintColor: COLORS.textPrimary,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgotPassword" />
      <Stack.Screen name="(tabs)" />

      <Stack.Screen 
        name="movieDetail" 
        options={{ 
          headerShown: true, 
        }} 
      />
      <Stack.Screen 
        name="editProfile" 
        options={{ 
          headerShown: true, 
          title: 'Editar Perfil', 
        }} 
      />
      <Stack.Screen 
        name="category/[name]" 
        options={{ 
          headerShown: true,
        }} 
      />
    </Stack>
  );
}