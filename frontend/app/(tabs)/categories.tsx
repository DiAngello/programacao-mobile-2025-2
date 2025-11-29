import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useRouter, Href } from 'expo-router';
import { getGenres } from '../../services/movieService';
import { Genre } from '../../types';

export default function CategoriesPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      setLoading(true);
      const fetchedGenres = await getGenres();
      setGenres(fetchedGenres);
      setLoading(false);
    };
    loadGenres();
  }, []);

  const handlePressCategory = (genre: Genre) => {
    const path = `/category/${genre.id}?name=${genre.name}`;
    router.push(path as Href);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Categorias</Text></View>
      <FlatList
        data={genres}
        keyExtractor={item => item.id.toString()} 
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem} onPress={() => handlePressCategory(item)}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  categoryItem: { backgroundColor: COLORS.surface, padding: 20, marginHorizontal: 20, marginBottom: 10, borderRadius: 8 },
  categoryText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
});