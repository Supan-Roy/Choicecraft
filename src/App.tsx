import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import {TVFocusGuideView} from '@amazon-devices/react-native-kepler';
import {ActionCard} from './components/ActionCard';
import {QRCodePlaceholder} from './components/QRCodePlaceholder';
import {RoomState, Participant} from './types/room';
import scrapTvCatalog from './data/scrapTvCatalog.json';
import {
  ChoicecraftEngine,
  Candidate,
  Participant as CoreParticipant,
  ConsensusResult,
} from 'choicecraft-core';

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
    status: 'ready',
    avatarColor: '#34D399',
  },
];

// Map royalty-free catalog items from scrapTvCatalog to Choicecraft Candidate entities
const CATALOG_CANDIDATES: Candidate[] = scrapTvCatalog.items.slice(0, 6).map((item, idx) => {
  const mockRuntimes = [85, 115, 75, 95, 125, 90];
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    genres: item.genres,
    runtimeMinutes: mockRuntimes[idx] || 90,
    contentRating: item.content_rating,
    attributes: {
      poster: item.images?.poster_16x9,
      thumbnail: item.images?.thumbnail_450x253,
      description: item.description,
      streamUrl: item.sources?.[0]?.url,
      ratingStars: item.rating_stars,
      releaseYear: item.release_year,
    },
  };
});

function buildCoreParticipants(
  participants: Participant[],
  candidates: Candidate[]
): CoreParticipant[] {
  const candidateIds = candidates.map((c) => c.id);

  return participants.map((p, idx) => {
    if (idx === 0) {
      // Host: prefers comedy, max runtime 120m, vetoes Horror
      return {
        id: p.id,
        name: p.name,
        hardConstraints: {
          maxRuntimeMinutes: 120,
          vetoedGenres: ['Horror'],
        },
        rankedCandidateIds: [candidateIds[3], candidateIds[0], candidateIds[2]],
        likedCandidateIds: [candidateIds[3]],
        ratings: {[candidateIds[3]]: 5},
      };
    }
    if (idx === 1) {
      // Alex: Documentary & Reality lover
      return {
        id: p.id,
        name: p.name,
        rankedCandidateIds: [candidateIds[0], candidateIds[1], candidateIds[3]],
        likedCandidateIds: [candidateIds[0]],
      };
    }
    if (idx === 2) {
      // Sam: Vetoes Reality, prefers Comedy
      return {
        id: p.id,
        name: p.name,
        hardConstraints: {
          vetoedGenres: ['Reality'],
        },
        rankedCandidateIds: [candidateIds[3], candidateIds[1]],
        likedCandidateIds: [candidateIds[3]],
        dislikedCandidateIds: [candidateIds[0]],
      };
    }
    // Dynamic joined participants
    const candidateShuffle = [...candidateIds].reverse();
    return {
      id: p.id,
      name: p.name,
      rankedCandidateIds: candidateShuffle,
      likedCandidateIds: [candidateShuffle[0]],
    };
  });
}

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'room' | 'how-it-works' | 'result'
  >('home');
  const [focusedCardId, setFocusedCardId] = useState<string>('create');
  const [roomActionFocus, setRoomActionFocus] = useState<
    'consensus' | 'simulate' | 'back'
  >('consensus');
  const [resultActionFocus, setResultActionFocus] = useState<
    'play' | 'new-vote' | 'back-room' | 'home'
  >('play');
  const [aboutFocus, setAboutFocus] = useState<boolean>(true);
  const [playbackActive, setPlaybackActive] = useState<boolean>(false);
  const [consensusResult, setConsensusResult] = useState<ConsensusResult | null>(
    null
  );

  const [roomState, setRoomState] = useState<RoomState>({
    code: 'CRAFT-728',
    category: 'Movie Night (ScrapTV Royalty-Free Catalog)',
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

  const handleRunConsensus = () => {
    const coreParticipants = buildCoreParticipants(
      roomState.participants,
      CATALOG_CANDIDATES
    );
    const engine = new ChoicecraftEngine({
      algorithm: 'hybrid',
      bordaWeight: 0.6,
      minimaxWeight: 0.4,
      tieBreaker: 'least_misery',
    });

    const result = engine.evaluate(CATALOG_CANDIDATES, coreParticipants);
    setConsensusResult(result);
    setPlaybackActive(false);
    setCurrentScreen('result');
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
              : currentScreen === 'result'
              ? 'Consensus Reached • Social Choice Model'
              : `Room: ${roomState.code}`}
          </Text>
        </View>
      </View>

      {/* Screen 1: Home Menu */}
      {currentScreen === 'home' && (
        <View style={styles.screenContainer}>
          <View style={styles.heroSection}>
            <Text style={styles.heroHeader}>Decide Together Without the Endless Scroll</Text>
            <Text style={styles.heroSubtitle}>
              Transform conflicting individual preferences into transparent, fair, and explainable shared decisions.
            </Text>
          </View>

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

          <View style={styles.navigationFooter}>
            <Text style={styles.navKeyBadge}>D-PAD</Text>
            <Text style={styles.navHintText}>Navigate between options</Text>
            <Text style={styles.navKeySeparator}>•</Text>
            <Text style={styles.navKeyBadge}>SELECT</Text>
            <Text style={styles.navHintText}>Confirm selection</Text>
          </View>
        </View>
      )}

      {/* Screen 2: Room Screen */}
      {currentScreen === 'room' && (
        <View style={styles.screenContainer}>
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

            {/* Right Column: Participants & Catalog Preview */}
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
                <Text style={styles.enginePanelTitle}>Choicecraft Core Engine (Standalone)</Text>
                <Text style={styles.enginePanelDesc}>
                  Hard Constraints ➔ Borda Scoring ➔ Minimax Regret ➔ Fairness Index
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom TV Remote Actions */}
          <TVFocusGuideView style={styles.roomActionsRow}>
            <Pressable
              testID="btn-run-consensus"
              accessibilityRole="button"
              accessibilityLabel="Run Choicecraft consensus engine"
              hasTVPreferredFocus={true}
              onFocus={() => setRoomActionFocus('consensus')}
              onPress={handleRunConsensus}
              style={[
                styles.remoteButton,
                styles.consensusPrimaryButton,
                roomActionFocus === 'consensus'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  styles.consensusPrimaryButtonText,
                  roomActionFocus === 'consensus' && styles.remoteButtonTextFocused,
                ]}>
                🚀 Calculate Consensus
              </Text>
            </Pressable>

            <Pressable
              testID="btn-simulate-join"
              accessibilityRole="button"
              accessibilityLabel="Simulate another participant joining"
              onFocus={() => setRoomActionFocus('simulate')}
              onPress={handleSimulateJoin}
              style={[
                styles.remoteButton,
                roomActionFocus === 'simulate'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  roomActionFocus === 'simulate' && styles.remoteButtonTextFocused,
                ]}>
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
                roomActionFocus === 'back'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  roomActionFocus === 'back' && styles.remoteButtonTextFocused,
                ]}>
                ← Return to Home
              </Text>
            </Pressable>
          </TVFocusGuideView>
        </View>
      )}

      {/* Screen 3: Consensus Result Reveal Screen */}
      {currentScreen === 'result' && consensusResult && (
        <View style={styles.screenContainer}>
          <View style={styles.resultContentRow}>
            {/* Left Area: The Winning Candidate Hero */}
            <View style={styles.resultWinnerColumn}>
              <View style={styles.winnerHeaderBadgeRow}>
                <View style={styles.winnerCrownBadge}>
                  <Text style={styles.winnerCrownText}>🏆 CONSENSUS WINNER</Text>
                </View>
                <View style={styles.streamReadyBadge}>
                  <Text style={styles.streamReadyText}>1080p Stream Ready</Text>
                </View>
              </View>

              {/* Poster Image */}
              {consensusResult.winner.attributes?.poster ? (
                <Image
                  source={{uri: consensusResult.winner.attributes.poster as string}}
                  style={styles.winnerPoster}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.posterFallback}>
                  <Text style={styles.posterFallbackText}>🎬</Text>
                </View>
              )}

              <Text style={styles.winnerTitle}>{consensusResult.winner.title}</Text>

              {/* Metadata Badges */}
              <View style={styles.winnerMetaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {consensusResult.winner.contentRating || 'TV-G'}
                  </Text>
                </View>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {consensusResult.winner.runtimeMinutes} min
                  </Text>
                </View>
                {consensusResult.winner.genres?.map((g) => (
                  <View key={g} style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{g}</Text>
                  </View>
                ))}
              </View>

              {/* Explanation Summary */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationHeadline}>
                  {consensusResult.decisionSummary.headline}
                </Text>
                <Text style={styles.explanationBody}>
                  {consensusResult.decisionSummary.whyItWon}
                </Text>
              </View>

              {playbackActive && (
                <View style={styles.playbackNotification}>
                  <Text style={styles.playbackNotificationText}>
                    ▶️ Streaming 1080p sample from official scrap-tv-feed...
                  </Text>
                </View>
              )}
            </View>

            {/* Right Area: Fairness Metrics & Compromise Audit */}
            <View style={styles.resultMetricsColumn}>
              <View style={styles.fairnessScoreCard}>
                <Text style={styles.metricsHeaderTitle}>Group Fairness Index</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.largeScoreText}>
                    {consensusResult.fairness.groupSatisfactionScore}%
                  </Text>
                  <View style={styles.scoreDetailGroup}>
                    <Text style={styles.scoreDetailTitle}>Overall Group Harmony</Text>
                    <Text style={styles.scoreDetailSubtitle}>
                      {consensusResult.fairness.isUnanimous
                        ? 'Unanimous selection across all ballots'
                        : `Least satisfied member: ${consensusResult.fairness.leastSatisfiedScore}%`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sacrifices & Compromises Made */}
              <Text style={styles.sectionSubtitle}>Compromises & Sacrifices</Text>
              <View style={styles.compromisesCard}>
                <Text style={styles.compromiseText}>
                  {consensusResult.decisionSummary.compromisesDescription}
                </Text>
              </View>

              {/* Hard Constraints & Veto Audit */}
              <Text style={styles.sectionSubtitle}>
                Vetoes & Hard Constraints Honored ({consensusResult.decisionSummary.vetoesHonoredCount})
              </Text>
              <ScrollView style={styles.eliminatedList}>
                {consensusResult.eliminated.length > 0 ? (
                  consensusResult.eliminated.map((el, i) => (
                    <View key={`${el.candidateId}-${i}`} style={styles.eliminatedItem}>
                      <Text style={styles.eliminatedTitle}>🚫 {el.candidateTitle}</Text>
                      <Text style={styles.eliminatedReason}>{el.explanation}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.eliminatedItem}>
                    <Text style={styles.eliminatedReason}>
                      No candidates violated any member's hard constraints.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          {/* Bottom Remote Action Bar */}
          <TVFocusGuideView style={styles.roomActionsRow}>
            <Pressable
              testID="btn-play-stream"
              accessibilityRole="button"
              accessibilityLabel="Play stream preview"
              hasTVPreferredFocus={true}
              onFocus={() => setResultActionFocus('play')}
              onPress={() => setPlaybackActive(true)}
              style={[
                styles.remoteButton,
                styles.playPrimaryButton,
                resultActionFocus === 'play'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  resultActionFocus === 'play' && styles.remoteButtonTextFocused,
                ]}>
                ▶️ Play Sample Stream
              </Text>
            </Pressable>

            <Pressable
              testID="btn-result-new-vote"
              accessibilityRole="button"
              accessibilityLabel="Run again with different votes"
              onFocus={() => setResultActionFocus('new-vote')}
              onPress={handleRunConsensus}
              style={[
                styles.remoteButton,
                resultActionFocus === 'new-vote'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  resultActionFocus === 'new-vote' && styles.remoteButtonTextFocused,
                ]}>
                🔄 Recalculate
              </Text>
            </Pressable>

            <Pressable
              testID="btn-result-back-room"
              accessibilityRole="button"
              accessibilityLabel="Back to room"
              onFocus={() => setResultActionFocus('back-room')}
              onPress={() => setCurrentScreen('room')}
              style={[
                styles.remoteButton,
                resultActionFocus === 'back-room'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  resultActionFocus === 'back-room' && styles.remoteButtonTextFocused,
                ]}>
                ← Back to Room
              </Text>
            </Pressable>

            <Pressable
              testID="btn-result-home"
              accessibilityRole="button"
              accessibilityLabel="Home menu"
              onFocus={() => setResultActionFocus('home')}
              onPress={() => setCurrentScreen('home')}
              style={[
                styles.remoteButton,
                resultActionFocus === 'home'
                  ? styles.remoteButtonFocused
                  : styles.remoteButtonDefault,
              ]}>
              <Text
                style={[
                  styles.remoteButtonText,
                  resultActionFocus === 'home' && styles.remoteButtonTextFocused,
                ]}>
                🏠 Home
              </Text>
            </Pressable>
          </TVFocusGuideView>
        </View>
      )}

      {/* Screen 4: How It Works */}
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
              <Text
                style={[
                  styles.remoteButtonText,
                  aboutFocus && styles.remoteButtonTextFocused,
                ]}>
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
  consensusPrimaryButton: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  consensusPrimaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  playPrimaryButton: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA',
  },
  remoteButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 8,
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
    fontSize: 15,
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
    marginHorizontal: 8,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  /* Result Screen Styles */
  resultContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultWinnerColumn: {
    flex: 1.2,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  winnerHeaderBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerCrownBadge: {
    backgroundColor: '#78350F',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  winnerCrownText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  streamReadyBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  streamReadyText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  winnerPoster: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#1F2937',
  },
  posterFallback: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  posterFallbackText: {
    fontSize: 48,
  },
  winnerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  winnerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  metaBadgeText: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '700',
  },
  genreBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  genreBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  explanationHeadline: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  explanationBody: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
  },
  playbackNotification: {
    marginTop: 10,
    backgroundColor: '#064E3B',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  playbackNotificationText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },
  resultMetricsColumn: {
    flex: 1.2,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  fairnessScoreCard: {
    backgroundColor: '#1E1B4B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3730A3',
    marginBottom: 14,
  },
  metricsHeaderTitle: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeScoreText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#34D399',
    marginRight: 16,
  },
  scoreDetailGroup: {
    flex: 1,
  },
  scoreDetailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scoreDetailSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 8,
    marginBottom: 6,
  },
  compromisesCard: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  compromiseText: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 17,
  },
  eliminatedList: {
    flex: 1,
  },
  eliminatedItem: {
    backgroundColor: '#1F2937',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  eliminatedTitle: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  eliminatedReason: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 15,
  },
  /* About Screen Styles */
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
