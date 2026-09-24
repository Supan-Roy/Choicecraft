import 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import * as React from 'react';

import {App} from '../src/App';

describe('Choicecraft TV App', () => {
  it('matches initial home snapshot', () => {
    const screen = render(<App />);
    expect(screen).toMatchSnapshot();
  });

  it('renders Choicecraft brand header and home action cards', () => {
    const screen = render(<App />);
    expect(screen.getByText('CHOICECRAFT')).toBeTruthy();
    expect(screen.getByText('Decide Together Without the Endless Scroll')).toBeTruthy();
    expect(screen.getByTestId('action-create-room')).toBeTruthy();
    expect(screen.getByTestId('action-join-room')).toBeTruthy();
    expect(screen.getByTestId('action-how-it-works')).toBeTruthy();
  });

  it('navigates to room preview screen upon pressing Create Room', () => {
    const screen = render(<App />);
    const createRoomCard = screen.getByTestId('action-create-room');

    fireEvent.press(createRoomCard);

    // Verify room screen elements
    expect(screen.getByText('Connect Your Phones')).toBeTruthy();
    expect(screen.getByText('ROOM CODE')).toBeTruthy();
    expect(screen.getByText('CRAFT-728')).toBeTruthy();
    expect(screen.getByTestId('btn-simulate-join')).toBeTruthy();
    expect(screen.getByTestId('btn-back-home')).toBeTruthy();
  });

  it('allows simulating participant joins dynamically', () => {
    const screen = render(<App />);
    fireEvent.press(screen.getByTestId('action-create-room'));

    expect(screen.getByText('3 Active')).toBeTruthy();

    const simulateBtn = screen.getByTestId('btn-simulate-join');
    fireEvent.press(simulateBtn);

    expect(screen.getByText('4 Active')).toBeTruthy();
  });

  it('navigates back to home screen from room preview', () => {
    const screen = render(<App />);
    fireEvent.press(screen.getByTestId('action-create-room'));

    const backHomeBtn = screen.getByTestId('btn-back-home');
    fireEvent.press(backHomeBtn);

    expect(screen.getByText('Decide Together Without the Endless Scroll')).toBeTruthy();
  });

  it('navigates to how-it-works screen and returns', () => {
    const screen = render(<App />);
    fireEvent.press(screen.getByTestId('action-how-it-works'));

    expect(screen.getByText('How Choicecraft Reaches Consensus')).toBeTruthy();
    expect(screen.getByText('Hard Constraints First')).toBeTruthy();

    fireEvent.press(screen.getByTestId('btn-about-back'));
    expect(screen.getByText('Decide Together Without the Endless Scroll')).toBeTruthy();
  });

  it('runs consensus engine and displays winner, fairness metrics, and decision explanation', () => {
    const screen = render(<App />);
    fireEvent.press(screen.getByTestId('action-create-room'));

    const runConsensusBtn = screen.getByTestId('btn-run-consensus');
    fireEvent.press(runConsensusBtn);

    // Verify consensus reveal elements
    expect(screen.getByText('🏆 CONSENSUS WINNER')).toBeTruthy();
    expect(screen.getByText('1080p Stream Ready')).toBeTruthy();
    expect(screen.getByText('Group Fairness Index')).toBeTruthy();
    expect(screen.getByText('Compromises & Sacrifices')).toBeTruthy();
    expect(screen.getByTestId('btn-play-stream')).toBeTruthy();

    // Verify stream playback simulation
    fireEvent.press(screen.getByTestId('btn-play-stream'));
    expect(
      screen.getByText('▶️ Streaming 1080p sample from official scrap-tv-feed...')
    ).toBeTruthy();

    // Navigate back to room
    fireEvent.press(screen.getByTestId('btn-result-back-room'));
    expect(screen.getByText('Connect Your Phones')).toBeTruthy();
  });
});
