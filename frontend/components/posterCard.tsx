import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Movie } from '../types';
import { COLORS } from '../constants/colors'; 

interface PosterCardProps {
  movie: Movie;
  onPress: () => void;
}

const PADDING = 15;
const GAP = 10;
const ITEM_WIDTH = (Dimensions.get('window').width - (PADDING * 2) - (GAP * 2)) / 3;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const PosterCard: React.FC<PosterCardProps> = ({ movie, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: movie.poster }}
        style={styles.poster}
        onError={(error) => {
          console.log(`ERRO AO CARREGAR IMAGEM para '${movie.title}':`, error.nativeEvent.error);
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginBottom: GAP,
    backgroundColor: COLORS.surface,
  },
  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default PosterCard;