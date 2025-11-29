import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Movie, Category } from '../types';
import MovieCard from './movieCard';
import { COLORS } from '../constants/colors';

interface MovieRowProps {
  category: Category;
  onMoviePress: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ category, onMoviePress }) => {
  if (!category.movies || category.movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.title}</Text>
      <FlatList
        data={category.movies}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <MovieCard movie={item} onPress={() => onMoviePress(item)} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 15,
  },
  listContent: {
    paddingLeft: 15,
  },
});

export default MovieRow;