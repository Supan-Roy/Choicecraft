import 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import * as React from 'react';

import {ActionCard} from '../src/components/ActionCard';

describe('ActionCard', () => {
  const defaultProps = {
    id: 'test-card',
    title: 'Test Card Title',
    subtitle: 'Test Card Subtitle',
    isFocused: false,
    onFocus: jest.fn(),
    onPress: jest.fn(),
    testID: 'action-card-test',
  };

  it('renders title, subtitle, and default state', () => {
    const screen = render(<ActionCard {...defaultProps} />);
    expect(screen.getByText('Test Card Title')).toBeTruthy();
    expect(screen.getByText('Test Card Subtitle')).toBeTruthy();
    expect(screen.getByText('Use Remote to Focus')).toBeTruthy();
  });

  it('shows prompt to press SELECT when focused', () => {
    const screen = render(<ActionCard {...defaultProps} isFocused={true} />);
    expect(screen.getByText('Press SELECT')).toBeTruthy();
  });

  it('handles press callback', () => {
    const onPressMock = jest.fn();
    const screen = render(<ActionCard {...defaultProps} onPress={onPressMock} />);
    fireEvent.press(screen.getByTestId('action-card-test'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
