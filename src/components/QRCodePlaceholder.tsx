import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export interface QRCodePlaceholderProps {
  roomCode: string;
}

export const QRCodePlaceholder: React.FC<QRCodePlaceholderProps> = ({
  roomCode,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.qrFrame}>
        <View style={styles.qrMatrix}>
          {/* Simulated QR Pattern Cells */}
          <View style={styles.patternRow}>
            <View style={[styles.cornerSquare, styles.topLeft]} />
            <View style={styles.patternDot} />
            <View style={[styles.cornerSquare, styles.topRight]} />
          </View>
          <View style={styles.patternRow}>
            <View style={styles.patternDot} />
            <View style={styles.centerCodeContainer}>
              <Text style={styles.centerBrand}>CC</Text>
            </View>
            <View style={styles.patternDot} />
          </View>
          <View style={styles.patternRow}>
            <View style={[styles.cornerSquare, styles.bottomLeft]} />
            <View style={styles.patternDot} />
            <View style={styles.cornerSquare} />
          </View>
        </View>
      </View>
      <View style={styles.codeBadge}>
        <Text style={styles.codeLabel}>ROOM CODE</Text>
        <Text style={styles.codeText}>{roomCode}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  qrMatrix: {
    width: 160,
    height: 160,
    justifyContent: 'space-between',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  cornerSquare: {
    width: 44,
    height: 44,
    borderWidth: 6,
    borderColor: '#0F172A',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeft: {
    backgroundColor: '#0F172A',
  },
  topRight: {
    borderColor: '#0284C7',
  },
  bottomLeft: {
    borderColor: '#0284C7',
  },
  patternDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#0F172A',
  },
  centerCodeContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBrand: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  codeBadge: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 3,
  },
});
