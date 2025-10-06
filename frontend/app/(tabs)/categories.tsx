// app/(tabs)/categories.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useRouter, Href } from 'expo-router';

const genres = [
  { id: '1', name: 'Ação' }, { id: '2', name: 'Comédia' }, { id: '3', name: 'Drama' },
  { id: '4', name: 'Ficção Científica' }, { id: '5', name: 'Terror' }, { id: '6', name: 'Romance' },
  { id: '7', name: 'História' }, { id: '8', name: 'Suspense' },
];

export default function CategoriesPage() {
  const router = useRouter();

   const handlePressCategory = (genreName: string) => {
    const path = `/category/${genreName}`;
    router.push(path as Href);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Categorias</Text></View>
      <FlatList
        data={genres}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem} onPress={() => handlePressCategory(item.name)}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  categoryItem: { backgroundColor: COLORS.surface, padding: 20, marginHorizontal: 20, marginBottom: 10, borderRadius: 8 },
  categoryText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
});