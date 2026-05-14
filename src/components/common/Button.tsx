import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...touchableProps
}) => {
  const { theme } = useTheme();
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: isOutline ? 'transparent' : theme.colors.primary,
          borderColor: theme.colors.primary,
          opacity: disabled || loading ? 0.65 : 1,
        },
        style as ViewStyle,
      ]}
      {...touchableProps}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: isOutline ? theme.colors.primary : '#FFFFFF' },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;