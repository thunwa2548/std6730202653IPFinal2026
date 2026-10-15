import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TIER_COLORS = {
  'Tier 1': {
    primary: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
    badge: '#ccfbf1',
  },
  'Tier 2': {
    primary: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    badge: '#dbeafe',
  },
  'Tier 3': {
    primary: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    badge: '#ede9fe',
  },
};

export default function ClusterCard({ cluster, totalEmployees = 1 }) {
  const colorScheme = TIER_COLORS[cluster.group] || TIER_COLORS['Tier 1'];
  const formattedCentroid = Number(cluster.centroid || 0).toLocaleString('en-US');
  const count = cluster.count || 0;
  const percentage = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;

  return (
    <View style={[styles.card, { backgroundColor: colorScheme.bg, borderColor: colorScheme.border }]}>
      <View style={styles.headerRow}>
        <View style={[styles.tierBadge, { backgroundColor: colorScheme.badge }]}>
          <Text style={[styles.tierTitle, { color: colorScheme.primary }]}>
            {cluster.group}
          </Text>
        </View>
        <Text style={[styles.countText, { color: colorScheme.primary }]}>
          {count} {count === 1 ? 'Employee' : 'Employees'} ({percentage}%)
        </Text>
      </View>

      <View style={styles.centroidSection}>
        <Text style={styles.centroidLabel}>Average Base Salary (Centroid)</Text>
        <Text style={[styles.centroidValue, { color: colorScheme.primary }]}>
          ฿{formattedCentroid}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centroidSection: {
    marginTop: 2,
  },
  centroidLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  centroidValue: {
    fontSize: 22,
    fontWeight: '800',
  },
});
