import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function EmployeeCard({ employee, onToggleStatus, onEdit, onDelete }) {
  const isActive = employee.status === 'Active';
  const formattedSalary = Number(employee.salary || 0).toLocaleString('en-US');

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{employee.name}</Text>
          <Text style={styles.positionText}>{employee.position}</Text>
        </View>

        <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.leaveBadge]}>
          <View style={[styles.statusDot, isActive ? styles.activeDot : styles.leaveDot]} />
          <Text style={[styles.statusText, isActive ? styles.activeText : styles.leaveText]}>
            {employee.status}
          </Text>
        </View>
      </View>

      <View style={styles.salarySection}>
        <Text style={styles.salaryLabel}>Monthly Salary</Text>
        <Text style={styles.salaryValue}>฿{formattedSalary}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => onToggleStatus(employee.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleButtonText}>
            {isActive ? 'Mark On Leave' : 'Set Active'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(employee)}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(employee.id, employee.name)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    paddingRight: 8,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  positionText: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  activeDot: {
    backgroundColor: '#16a34a',
  },
  activeText: {
    color: '#15803d',
    fontWeight: '600',
    fontSize: 12,
  },
  leaveBadge: {
    backgroundColor: '#fef3c7',
  },
  leaveDot: {
    backgroundColor: '#d97706',
  },
  leaveText: {
    color: '#b45309',
    fontWeight: '600',
    fontSize: 12,
  },
  salarySection: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  salaryLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  salaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  toggleButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 13,
  },
  editButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  editButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
});
