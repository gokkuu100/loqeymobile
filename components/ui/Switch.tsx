import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';

interface CustomSwitchProps extends SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Switch({ value, onValueChange, ...props }: CustomSwitchProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ 
        false: colors.tabIconDefault + '40', 
        true: colors.tint + '80' 
      }}
      thumbColor={value ? colors.tint : colors.tabIconDefault}
      ios_backgroundColor={colors.tabIconDefault + '40'}
      {...props}
    />
  );
}
