import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  isGrid?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress, isGrid }) => {
  return (
    <TouchableOpacity style={[styles.cardContainer, isGrid && styles.gridItem]} onPress={onPress}>
      <Image source={{ uri: movie.poster }} style={styles.poster} />
      <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" color={COLORS.accent} size={16} />
        <Text style={styles.movieRating}>{movie.rating}</Text>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  cardContainer: {
    width: 140,
    marginRight: 15,
  },
  gridItem: {
    width: (screenWidth - 50) / 2, 
    marginRight: 10,
    marginBottom: 20,
  },
  poster: {
    width: '100%',
    height: 210,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
  },
  movieTitle: {
    color: COLORS.textPrimary,
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  movieRating: {
    color: COLORS.textSecondary,
    marginLeft: 5,
    fontSize: 12,
  },
});

export default MovieCard;