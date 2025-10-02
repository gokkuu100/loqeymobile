import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Shadow, BorderRadius, Spacing } from '../../constants/Theme';
import { useColorScheme } from '../../hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadow;
  borderRadius?: keyof typeof BorderRadius;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = 'small',
  borderRadius = 'md',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: Spacing[padding],
          borderRadius: BorderRadius[borderRadius],
        },
        Shadow[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
