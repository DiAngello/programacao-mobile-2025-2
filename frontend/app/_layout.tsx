import { Stack } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="forgotPassword" 
        options={{ presentation: 'modal' }} /> 
      <Stack.Screen
        name="movieDetail"
        options={{
          headerShown: true,
          title: 'Detalhes',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.textPrimary,
        }}
      />
      <Stack.Screen
        name="editProfile"
        options={{
          headerShown: true,
          title: 'Editar Perfil',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.textPrimary,
        }}
      />
    </Stack>
  );
}