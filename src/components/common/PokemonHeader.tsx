import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PokemonHeaderProps {
  title?: string;
  backgroundColor?: string;
}

const PokemonHeader: React.FC<PokemonHeaderProps> = ({ 
  title = 'POKEMON', 
  backgroundColor = '#FFD700' 
}) => {
  // Fallback font families yang mirip game
  const fontFamily = 'Arial Rounded MT Bold'; // Font yang umum tersedia di iOS
  // Alternatif: 'Impact', 'Arial Black', 'Franklin Gothic Heavy'

  const renderLightningLetters = () => {
    return title.split('').map((letter, index) => (
      <View key={index} style={styles.letterContainer}>
        <Text style={[
          styles.letterText,
          { fontFamily },
          index % 2 === 0 ? styles.evenLetter : styles.oddLetter,
          (index === 2 || index === 5) && styles.zigzagLetter
        ]}>
          {letter}
        </Text>
        {(index === 1 || index === 4 || index === 7) && (
          <View style={[
            styles.letterLightning,
            index === 1 && styles.lightningTop,
            index === 4 && styles.lightningMiddle,
            index === 7 && styles.lightningBottom
          ]} />
        )}
      </View>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.backgroundLightning}>
        <View style={[styles.bigLightning, styles.bigBolt1]} />
        <View style={[styles.bigLightning, styles.bigBolt2]} />
        <View style={[styles.bigLightning, styles.bigBolt3]} />
        <View style={[styles.bigLightning, styles.bigBolt4]} />
      </View>
      
      <View style={styles.electricBorderTop} />
      <View style={styles.electricBorderBottom} />
      
      <View style={styles.titleContainer}>
        {renderLightningLetters()}
      </View>
      
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitleText, { fontFamily }]}>⚡ ELECTRIC UNIVERSE ⚡</Text>
      </View>

      <View style={[styles.spark, styles.spark1]} />
      <View style={[styles.spark, styles.spark2]} />
      <View style={[styles.spark, styles.spark3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderBottomWidth: 4,
    borderBottomColor: '#1E3A8A',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 15,
  },
  backgroundLightning: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bigLightning: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    transform: [{ skewY: '-25deg' }],
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  bigBolt1: {
    width: 12,
    height: '120%',
    left: '15%',
    top: '-10%',
  },
  bigBolt2: {
    width: 8,
    height: '140%',
    left: '35%',
    top: '-20%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  bigBolt3: {
    width: 10,
    height: '130%',
    left: '65%',
    top: '-15%',
  },
  bigBolt4: {
    width: 6,
    height: '110%',
    left: '85%',
    top: '-5%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  electricBorderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  electricBorderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  letterContainer: {
    position: 'relative',
    marginHorizontal: 2,
  },
  letterText: {
    fontSize: 32,
    fontWeight: '900',
    // Font family akan di-set inline
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
    // textShadowColor: '#1E3A8A',
    // textShadowOffset: { width: -3, height: -3 },
    // textShadowRadius: 0,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  evenLetter: {
    color: '#FFD700',
    textShadowColor: '#1E3A8A',
    textShadowOffset: { width: -2, height: -2 },
    transform: [{ translateY: -2 }],
    shadowColor: '#1E3A8A',
  },
  oddLetter: {
    color: '#3B82F6',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 2, height: 2 },
    transform: [{ translateY: 2 }],
    shadowColor: '#FFD700',
  },
  zigzagLetter: {
    transform: [{ skewX: '10deg' }, { translateY: -1 }],
    color: '#FFFFFF',
    textShadowColor: '#3B82F6',
    textShadowOffset: { width: 0, height: 0 },
  },
  letterLightning: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  lightningTop: {
    width: 4,
    height: 12,
    top: -8,
    left: '50%',
    transform: [{ translateX: -2 }, { rotate: '45deg' }],
  },
  lightningMiddle: {
    width: 3,
    height: 15,
    bottom: -10,
    left: '30%',
    transform: [{ rotate: '-45deg' }],
  },
  lightningBottom: {
    width: 4,
    height: 10,
    top: -6,
    right: '40%',
    transform: [{ rotate: '135deg' }],
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 3,
    textShadowColor: '#3B82F6',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  spark: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  spark1: {
    width: 3,
    height: 3,
    top: 20,
    left: 50,
  },
  spark2: {
    width: 2,
    height: 2,
    top: 40,
    right: 60,
  },
  spark3: {
    width: 4,
    height: 4,
    bottom: 25,
    left: 80,
  },
});

export default PokemonHeader;