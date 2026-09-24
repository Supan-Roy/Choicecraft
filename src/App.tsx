import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import {TVFocusGuideView} from '@amazon-devices/react-native-kepler';
import {ActionCard} from './components/ActionCard';
import {QRCodePlaceholder} from './components/QRCodePlaceholder';
import {RoomState, Participant} from './types/room';

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'host-1',
    name: 'Living Room TV (Host)',
    isHost: true,
    status: 'connected',
    avatarColor: '#38BDF8',
  },
  {
    id: 'p-2',
    name: 'Alex (Phone)',
    isHost: false,
    status: 'ready',
    avatarColor: '#A78BFA',
  },
  {
    id: 'p-3',
    name: 'Sam (Phone)',
    isHost: false,
    status: 'inputting',
    avatarColor: '#34D399',
  },
];

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'room' | 'how-it-works'>('home');
  const [focusedCardId, setFocusedCardId] = useState<string>('create');
  const [roomActionFocus, setRoomActionFocus] = useState<'simulate' | 'back'>('simulate');
  const [aboutFocus, setAboutFocus] = useState<boolean>(true);

  const [roomState, setRoomState] = useState<RoomState>({
    code: 'CRAFT-728',
    category: 'Movie Night (Seed Catalog)',
    status: 'waiting_for_participants',
    participants: INITIAL_PARTICIPANTS,
  });

  const handleSimulateJoin = () => {
    const nextIndex = roomState.participants.length + 1;
    const names = ['Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley'];
    const selectedName = names[(nextIndex - 1) % names.length];
    const colors = ['#F472B6', '#FBBF24', '#60A5FA', '#4ADE80'];

    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      name: `${selectedName} (Phone)`,
      isHost: false,
      status: 'ready',
      avatarColor: colors[nextIndex % colors.length],
    };

    setRoomState((prev) => ({
      ...prev,
      participants: [...prev.participants, newParticipant],
    }));
  };

  const handleResetParticipants = () => {
    setRoomState((prev) => ({
      ...prev,
      participants: INITIAL_PARTICIPANTS,
    }));
  };

  return (
    <View style={styles.container}>
      {/* Top Universal Branding Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>CC</Text>
          </View>
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>CHOICECRAFT</Text>
            <Text style={styles.brandTagline}>TV Group Consensus Platform</Text>
          </View>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>
            {currentScreen === 'home'
              ? 'Vega OS 1.2 • Fire TV Ready'
              : `Room: ${roomState.code}`}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      {currentScreen === 'home' && (
        <View style={styles.screenContainer}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroHeader}>Decide Together Without the Endless Scroll</Text>
            <Text style={styles.heroSubtitle}>
              Transform conflicting individual preferences into transparent, fair, and explainable shared decisions.
            </Text>
          </View>

          {/* Action Cards Row */}
          <TVFocusGuideView style={styles.cardsRow}>
            <ActionCard
              id="create"
              title="Create Room"
              subtitle="Start a new shared session. Displays room code & QR code on this TV for participants to join from phones."
              badge="Host Session"
              iconText="✨"
              isFocused={focusedCardId === 'create'}
              onFocus={() => setFocusedCardId('create')}
              onPress={() => setCurrentScreen('room')}
              hasTVPreferredFocus={true}
              testID="action-create-room"
              style={styles.cardItem}
            />

            <ActionCard
              id="join"
              title="Mobile Join Info"
              subtitle="Participants use their private phone browsers. No app download required. Keeps preferences private."
              badge="No App Needed"
              iconText="📱"
              isFocused={focusedCardId === 'join'}
              onFocus={() => setFocusedCardId('join')}
              onPress={() => setCurrentScreen('room')}
              testID="action-join-room"
              style={styles.cardItem}
            />

            <ActionCard
              id="how"
              title="How It Works"
              subtitle="Learn about the 4-step consensus pipeline: hard constraints, satisfaction scoring, fairness, and explanations."
              badge="Consensus Engine"
              iconText="⚖️"
              isFocused={focusedCardId === 'how'}
              onFocus={() => setFocusedCardId('how')}
              onPress={() => setCurrentScreen('how-it-works')}
              testID="action-how-it-works"
              style={styles.cardItem}
            />
          </TVFocusGuideView>

          {/* Remote Navigation Hint Footer */}
          <View style={styles.navigationFooter}>
            <Text style={styles.navKeyBadge}>D-PAD</Text>
            <Text style={styles.navHintText}>Navigate between options</Text>
            <Text style={styles.navKeySeparator}>•</Text>
            <Text style={styles.navKeyBadge}>SELECT</Text>
            <Text style={styles.navHintText}>Confirm selection</Text>
          </View>
        </View>
      )}

      {currentScreen === 'room' && (
        <View style={styles.screenContainer}>
          {/* Room Screen Layout */}
          <View style={styles.roomContentRow}>
            {/* Left Column: QR Code & Mobile Connection Instructions */}
            <View style={styles.roomLeftColumn}>
              <Text style={styles.columnTitle}>Connect Your Phones</Text>
              <Text style={styles.columnSubtitle}>
                Scan the QR code or open choicecraft.app on your mobile browser.
              </Text>

              <View style={styles.qrWrapper}>
                <QRCodePlaceholder roomCode={roomState.code} />
              </View>

              <View style={styles.instructionsBox}>
                <Text style={styles.instructionStep}>1. Scan QR code or enter code {roomState.code}</Text>
                <Text style={styles.instructionStep}>2. Privately submit runtime limits & excluded genres</Text>
                <Text style={styles.instructionStep}>3. Choicecraft consensus engine balances fairness</Text>
              </View>
            </View>

            {/* Right Column: Participants & Consensus Status */}
            <View style={styles.roomRightColumn}>
              <View style={styles.rosterHeaderRow}>
                <Text style={styles.columnTitle}>Participants in Room</Text>
                <View style={styles.participantCountBadge}>
                  <Text style={styles.participantCountText}>
                    {roomState.participants.length} Active
                  </Text>
                </View>
              </View>
              <Text style={styles.columnSubtitle}>
                Domain: {roomState.category}
              </Text>

              {/* Participant List */}
              <ScrollView style={styles.rosterList}>
                {roomState.participants.map((participant) => (
                  <View key={participant.id} style={styles.participantCard}>
                    <View
                      style={[
                        styles.participantAvatar,
                        {backgroundColor: participant.avatarColor},
                      ]}>
                      <Text style={styles.avatarInitial}>
                        {participant.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant.name}
                      </Text>
                      <Text style={styles.participantSub}>
                        {participant.isHost ? 'Host Surface' : 'Mobile Participant'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        participant.status === 'ready'
                          ? styles.statusReady
                          : styles.statusPending,
                      ]}>
                      <Text style={styles.statusBadgeText}>
                        {participant.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Consensus Engine Status Panel */}
              <View style={styles.enginePanel}>
                <Text style={styles.enginePanelTitle}>Consensus Engine Pipeline</Text>
                <Text style={styles.enginePanelDesc}>
                  Hard Constraints ➔ Soft Preferences ➔ Fairness Balancing ➔ Explanation
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom TV Remote Actions */}
          <TVFocusGuideView style={styles.roomActionsRow}>
            <Pressable
              testID="btn-simulate-join"
              accessibilityRole="button"
              accessibilityLabel="Simulate another participant joining"
              hasTVPreferredFocus={true}
              onFocus={() => setRoomActionFocus('simulate')}
              onPress={handleSimulateJoin}
              style={[
                styles.remoteButton,
                roomActionFocus === 'simulate' ? styles.remoteButtonFocused : styles.remoteButtonDefault,
              ]}>
              <Text style={[styles.remoteButtonText, roomActionFocus === 'simulate' && styles.remoteButtonTextFocused]}>
                + Simulate Participant Join
              </Text>
            </Pressable>

            <Pressable
              testID="btn-reset-participants"
              accessibilityRole="button"
              accessibilityLabel="Reset participant list"
              onPress={handleResetParticipants}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Reset List</Text>
            </Pressable>

            <Pressable
              testID="btn-back-home"
              accessibilityRole="button"
              accessibilityLabel="Return to home screen"
              onFocus={() => setRoomActionFocus('back')}
              onPress={() => setCurrentScreen('home')}
              style={[
                styles.remoteButton,
                roomActionFocus === 'back' ? styles.remoteButtonFocused : styles.remoteButtonDefault,
              ]}>
              <Text style={[styles.remoteButtonText, roomActionFocus === 'back' && styles.remoteButtonTextFocused]}>
                ← Return to Home
              </Text>
            </Pressable>
          </TVFocusGuideView>
        </View>
      )}

      {currentScreen === 'how-it-works' && (
        <View style={styles.screenContainer}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutHeader}>How Choicecraft Reaches Consensus</Text>
            <Text style={styles.aboutSub}>
              Unlike simple voting or majority-rule systems, Choicecraft protects fairness and individual limits:
            </Text>

            <View style={styles.stepGrid}>
              <View style={styles.stepCard}>
                <Text style={styles.stepNumber}>01</Text>
                <Text style={styles.stepHeading}>Hard Constraints First</Text>
                <Text style={styles.stepDetail}>
                  Strict filters (maximum runtime, excluded genres, family ratings) are applied deterministically. Any candidate violating a hard limit is eliminated.
                </Text>
              </View>

              <View style={styles.stepCard}>
                <Text style={styles.stepNumber}>02</Text>
                <Text style={styles.stepHeading}>Soft Preference Scoring</Text>
                <Text style={styles.stepDetail}>
                  Remaining options are scored against individual preferences (moods, preferred genres, favorites) to measure individual satisfaction.
                </Text>
              </View>

              <View style={styles.stepCard}>
                <Text style={styles.stepNumber}>03</Text>
                <Text style={styles.stepHeading}>Fairness-Aware Ranking</Text>
                <Text style={styles.stepDetail}>
                  The engine evaluates minimum participant satisfaction and avoids repeatedly penalizing the same participant.
                </Text>
              </View>

              <View style={styles.stepCard}>
                <Text style={styles.stepNumber}>04</Text>
                <Text style={styles.stepHeading}>Explainable Decisions</Text>
                <Text style={styles.stepDetail}>
                  The group sees why the choice was selected, which constraints were honored, and what tradeoffs were made.
                </Text>
              </View>
            </View>

            <Pressable
              testID="btn-about-back"
              accessibilityRole="button"
              accessibilityLabel="Back to Home Screen"
              hasTVPreferredFocus={true}
              onFocus={() => setAboutFocus(true)}
              onBlur={() => setAboutFocus(false)}
              onPress={() => setCurrentScreen('home')}
              style={[
                styles.aboutBackButton,
                aboutFocus ? styles.remoteButtonFocused : styles.remoteButtonDefault,
              ]}>
              <Text style={[styles.remoteButtonText, aboutFocus && styles.remoteButtonTextFocused]}>
                ← Back to Main Menu
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
    paddingHorizontal: 64,
    paddingVertical: 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 13,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusPillText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroSection: {
    marginBottom: 16,
  },
  heroHeader: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#94A3B8',
    maxWidth: 900,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginVertical: 16,
  },
  cardItem: {
    flex: 1,
    marginHorizontal: 12,
    minHeight: 220,
  },
  navigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
  },
  navKeyBadge: {
    backgroundColor: '#334155',
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  navHintText: {
    color: '#94A3B8',
    fontSize: 14,
    marginRight: 16,
  },
  navKeySeparator: {
    color: '#475569',
    fontSize: 14,
    marginRight: 16,
  },
  roomContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomLeftColumn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    alignItems: 'center',
  },
  roomRightColumn: {
    flex: 1.4,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  columnTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  columnSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrWrapper: {
    marginVertical: 12,
  },
  instructionsBox: {
    marginTop: 12,
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 10,
    width: '100%',
  },
  instructionStep: {
    fontSize: 13,
    lineHeight: 18,
    color: '#D1D5DB',
    marginVertical: 2,
  },
  rosterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCountBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantCountText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  rosterList: {
    flex: 1,
    marginVertical: 8,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  participantSub: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusReady: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F3F4F6',
    letterSpacing: 0.5,
  },
  enginePanel: {
    backgroundColor: '#1E1B4B',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3730A3',
    marginTop: 8,
  },
  enginePanelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A5B4FC',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  enginePanelDesc: {
    fontSize: 12,
    color: '#C7D2FE',
  },
  roomActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
  },
  remoteButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 10,
    borderWidth: 2,
  },
  remoteButtonDefault: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  remoteButtonFocused: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
    transform: [{scale: 1.05}],
  },
  remoteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  remoteButtonTextFocused: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 10,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1F2937',
    justifyContent: 'space-between',
  },
  aboutHeader: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  aboutSub: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  stepGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#38BDF8',
    marginBottom: 8,
  },
  stepHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  stepDetail: {
    fontSize: 12,
    lineHeight: 17,
    color: '#9CA3AF',
  },
  aboutBackButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
});
