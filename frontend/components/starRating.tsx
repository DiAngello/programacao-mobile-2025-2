import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, maxStars = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starNumber = index + 1;
        return (
          <TouchableOpacity key={starNumber} onPress={() => onRatingChange(starNumber)}>
            <Ionicons
              name={starNumber <= rating ? 'star' : 'star-outline'}
              size={32}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StarRating;