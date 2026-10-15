import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { API_BASE_URL, getApiBaseUrl } from '../config/api';
import EmployeeCard from '../components/EmployeeCard';
import ClusterCard from '../components/ClusterCard';

// Cross-platform Alert helper (Web uses window.alert, Mobile uses Alert.alert)
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Separate AddEmployeeForm component to prevent FlatList re-renders and input focus loss
function AddEmployeeForm({ onAddEmployee, submitting }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = () => {
    onAddEmployee(name, position, salary, () => {
      setName('');
      setPosition('');
      setSalary('');
    });
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>➕ Add New Employee</Text>
      <Text style={styles.formSubtitle}>Create an employee record</Text>

      <View style={styles.inputField}>
        <Text style={styles.fieldLabel}>Full Name</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. John Doe"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputField}>
        <Text style={styles.fieldLabel}>Position</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. Software Engineer"
          placeholderTextColor="#94a3b8"
          value={position}
          onChangeText={setPosition}
        />
      </View>

      <View style={styles.inputField}>
        <Text style={styles.fieldLabel}>Monthly Salary (THB)</Text>
        <TextInput
          style={styles.formInput}
          placeholder="e.g. 45000"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={salary}
          onChangeText={setSalary}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Add Employee</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Edit Employee Modal Component
function EditEmployeeModal({ visible, employee, onSave, onClose }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState('Active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setPosition(employee.position || '');
      setSalary(String(employee.salary || ''));
      setStatus(employee.status || 'Active');
    }
  }, [employee]);

  const handleSave = async () => {
    if (!name.trim() || !position.trim() || !salary.trim()) {
      showAlert('Validation Error', 'Please fill in all fields (Name, Position, Salary).');
      return;
    }
    const numericSalary = Number(salary);
    if (isNaN(numericSalary) || numericSalary <= 0) {
      showAlert('Validation Error', 'Salary must be a valid positive number.');
      return;
    }

    setSaving(true);
    await onSave(employee.id, {
      name: name.trim(),
      position: position.trim(),
      salary: numericSalary,
      status: status
    });
    setSaving(false);
  };

  if (!visible || !employee) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>✏️ Edit Employee</Text>
              <Text style={styles.modalSubtitle}>Update details for ID: {employee.id}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.formInput}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>Position</Text>
            <TextInput
              style={styles.formInput}
              value={position}
              onChangeText={setPosition}
              placeholder="Position"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>Monthly Salary (THB)</Text>
            <TextInput
              style={styles.formInput}
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
              placeholder="Salary"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>Employment Status</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[
                  styles.statusChoiceBtn,
                  status === 'Active' && styles.statusChoiceActive
                ]}
                onPress={() => setStatus('Active')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statusChoiceText,
                    status === 'Active' && styles.statusChoiceTextActive
                  ]}
                >
                  🟢 Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusChoiceBtn,
                  status === 'On Leave' && styles.statusChoiceLeave
                ]}
                onPress={() => setStatus('On Leave')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statusChoiceText,
                    status === 'On Leave' && styles.statusChoiceTextLeave
                  ]}
                >
                  🟠 On Leave
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onClose}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalSaveBtn, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function DashboardScreen({ userToken, username, apiUrl, onLogout }) {
  const activeUrl = apiUrl || getApiBaseUrl() || API_BASE_URL;

  // Employee list states
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal states
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Analytics states (Phase 2 K-Means)
  const [clusters, setClusters] = useState(null);
  const [loadingClusters, setLoadingClusters] = useState(false);

  // Fetch employees list from backend
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${activeUrl}/api/employees`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch Employees Error:', error);
      showAlert('Error', `Failed to load employees: ${error.message}`);
    }
  }, [activeUrl]);

  // Initial load
  useEffect(() => {
    setLoadingEmployees(true);
    fetchEmployees().finally(() => setLoadingEmployees(false));
  }, [fetchEmployees]);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  };

  // Add Employee with client-side validation
  const handleAddEmployee = async (formName, formPosition, formSalary, resetForm) => {
    if (!formName.trim() || !formPosition.trim() || !formSalary.trim()) {
      showAlert('Validation Error', 'Please fill in all fields (Name, Position, Salary).');
      return;
    }

    const numericSalary = Number(formSalary);
    if (isNaN(numericSalary) || numericSalary <= 0) {
      showAlert('Validation Error', 'Salary must be a valid positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${activeUrl}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName.trim(),
          position: formPosition.trim(),
          salary: numericSalary,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        if (resetForm) resetForm();
        await fetchEmployees();

        if (clusters) {
          fetchSalaryClusters();
        }

        showAlert('Success', `Employee "${data.name}" added successfully.`);
      } else {
        showAlert('Error', data.message || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Add Employee Error:', error);
      showAlert('Network Error', `Could not add employee: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalVisible(true);
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setIsEditModalVisible(false);
    setEditingEmployee(null);
  };

  // Save Edit Employee
  const handleSaveEdit = async (id, updatedData) => {
    try {
      const response = await fetch(`${activeUrl}/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updated = await response.json();
        // Update local state
        setEmployees((prev) =>
          prev.map((emp) => (String(emp.id) === String(id) ? updated : emp))
        );
        handleCloseEdit();
        if (clusters) {
          fetchSalaryClusters();
        }
        showAlert('Success', `Employee "${updated.name}" updated successfully.`);
      } else {
        const errData = await response.json();
        showAlert('Error', errData.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Save Edit Error:', error);
      showAlert('Network Error', `Could not update employee: ${error.message}`);
    }
  };

  // Toggle Employee Status
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${activeUrl}/api/employees/${id}/status`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updated = await response.json();
        setEmployees((prev) =>
          prev.map((emp) => (String(emp.id) === String(id) ? updated : emp))
        );
      } else {
        const errData = await response.json();
        showAlert('Error', errData.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Toggle Status Error:', error);
      showAlert('Network Error', `Could not toggle status: ${error.message}`);
    }
  };

  // Delete Employee with mandatory Confirmation Dialog
  const handleDeleteEmployee = (id, employeeName) => {
    const executeDelete = async () => {
      try {
        const response = await fetch(`${activeUrl}/api/employees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEmployees((prev) => prev.filter((emp) => String(emp.id) !== String(id)));
          if (clusters) {
            fetchSalaryClusters();
          }
          showAlert('Deleted', 'Employee has been removed successfully.');
        } else {
          const errData = await response.json();
          const errMsg = errData.message || 'Failed to delete employee';
          showAlert('Error', errMsg);
        }
      } catch (error) {
        console.error('Delete Error:', error);
        showAlert('Network Error', `Could not delete employee: ${error.message}`);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Confirm Delete: Are you sure you want to delete ${employeeName || 'this employee'}?`
      );
      if (confirmed) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${employeeName || 'this employee'}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  // Phase 2: K-Means Salary Clustering API Call
  const fetchSalaryClusters = async () => {
    setLoadingClusters(true);
    try {
      const response = await fetch(`${activeUrl}/api/employees/salary-clusters`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();

      if (data.success && Array.isArray(data.clusters)) {
        setClusters(data.clusters);
      } else {
        showAlert('Analytics Error', 'Invalid cluster data received from server');
      }
    } catch (error) {
      console.error('Fetch Salary Clusters Error:', error);
      showAlert('Analytics Error', `Failed to calculate clusters: ${error.message}`);
    } finally {
      setLoadingClusters(false);
    }
  };

  // Filtered employees list based on search query
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter((emp) => {
      const nameMatch = emp.name && emp.name.toLowerCase().includes(q);
      const posMatch = emp.position && emp.position.toLowerCase().includes(q);
      const statusMatch = emp.status && emp.status.toLowerCase().includes(q);
      const salaryMatch = String(emp.salary || '').includes(q);
      return nameMatch || posMatch || statusMatch || salaryMatch;
    });
  }, [employees, searchQuery]);

  // List Header Component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>HR Dashboard</Text>
          <Text style={styles.welcomeText}>
            Logged in as <Text style={styles.usernameHighlight}>{username || 'admin'}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Phase 2: K-Means Salary Analytics Section */}
      <View style={styles.analyticsSection}>
        <View style={styles.analyticsHeader}>
          <View style={styles.analyticsTitleRow}>
            <Text style={styles.analyticsIcon}>🧠</Text>
            <View>
              <Text style={styles.analyticsTitle}>Salary Structure Analytics</Text>
              <Text style={styles.analyticsSubtitle}>1D K-Means Clustering (k=3)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, loadingClusters && styles.disabledButton]}
            onPress={fetchSalaryClusters}
            disabled={loadingClusters}
            activeOpacity={0.8}
          >
            {loadingClusters ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.analyzeButtonText}>
                {clusters ? 'Re-Analyze' : 'Analyze Salary Structure'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {loadingClusters && (
          <View style={styles.loadingClustersContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingClustersText}>
              Running K-Means Clustering on employee salaries...
            </Text>
          </View>
        )}

        {clusters && !loadingClusters && (
          <View style={styles.clustersList}>
            {clusters.map((cluster, index) => (
              <ClusterCard
                key={index}
                cluster={cluster}
                totalEmployees={employees.length}
              />
            ))}
          </View>
        )}
      </View>

      {/* Add Employee Form */}
      <AddEmployeeForm onAddEmployee={handleAddEmployee} submitting={submitting} />

      {/* Search Input Bar */}
      <View style={styles.searchBarCard}>
        <View style={styles.searchBarRow}>
          <Text style={styles.searchBarIcon}>🔍</Text>
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search by name, position or salary..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Employees List Header */}
      <View style={styles.listSectionHeader}>
        <Text style={styles.sectionTitle}>Employee Records</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {searchQuery.trim()
              ? `${filteredEmployees.length} of ${employees.length}`
              : `${employees.length} Total`}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EmployeeCard
              employee={item}
              onToggleStatus={handleToggleStatus}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteEmployee}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            loadingEmployees ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.emptyText}>Loading employees...</Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>
                  {searchQuery.trim() ? 'No Matching Employees' : 'No Employees Found'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? `No employees matching "${searchQuery}". Try a different keyword.`
                    : 'Add an employee using the form above or pull down to refresh.'}
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        visible={isEditModalVisible}
        employee={editingEmployee}
        onSave={handleSaveEdit}
        onClose={handleCloseEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  usernameHighlight: {
    fontWeight: '700',
    color: '#2563eb',
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  analyticsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  analyticsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analyticsIcon: {
    fontSize: 26,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1b4b',
  },
  analyticsSubtitle: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingClustersContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingClustersText: {
    marginTop: 10,
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '500',
  },
  clustersList: {
    marginTop: 14,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
  },
  inputField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  searchBarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 4,
  },
  clearSearchBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    marginLeft: 6,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statusChoiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  statusChoiceActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  statusChoiceLeave: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  statusChoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  statusChoiceTextActive: {
    color: '#15803d',
    fontWeight: '700',
  },
  statusChoiceTextLeave: {
    color: '#b45309',
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
