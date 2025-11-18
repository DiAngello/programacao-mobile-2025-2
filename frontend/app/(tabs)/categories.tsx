import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useRouter, Href } from 'expo-router';
// Importa o serviço e o tipo
import { getGenres } from '../../services/movieService';
import { Genre } from '../../types';

export default function CategoriesPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os gêneros reais da API ao carregar a tela
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
    // Passa o ID do gênero pela rota e o NOME pela query param
    // A tela de destino será /category/[id] (ex: /category/28?name=Ação)
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
        keyExtractor={item => item.id.toString()} // IDs agora são números
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