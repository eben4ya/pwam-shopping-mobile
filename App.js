import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

const YELLOW = '#FFD600';
const BLACK  = '#1A1A1A';
const GRAY   = '#9CA3AF';
const LIGHT  = '#F3F4F6';

/* ── Edit Modal ─────────────────────────────────────── */
function EditModal({ item, onSave, onCancel }) {
  const [val, setVal] = useState('');

  useEffect(() => {
    if (item) setVal(item.name);
  }, [item]);

  const handleSave = () => {
    if (!val.trim()) { onCancel(); return; }
    onSave(item.id, val.trim());
  };

  return (
    <Modal transparent animationType="slide" visible={!!item} onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Item</Text>
          <TextInput
            style={styles.modalInput}
            value={val}
            onChangeText={setVal}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            placeholder="Item name"
            placeholderTextColor={GRAY}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ── Item Row ───────────────────────────────────────── */
function ItemRow({ item, index, onToggle, onEdit, onDelete }) {
  const checked = Boolean(item.checked);

  return (
    // Tapping anywhere on the row (outside Edit/circle) triggers delete
    <TouchableOpacity
      style={styles.item}
      onPress={() => onDelete(item)}
      activeOpacity={0.6}
    >
      <Text style={styles.itemIndex}>{String(index + 1).padStart(2, '0')}</Text>

      <View style={styles.itemBody}>
        <Text
          style={checked ? [styles.itemName, styles.itemNameDone] : styles.itemName}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </View>

      {/* Edit pill — inner touchable captures its own press, won't bubble up */}
      <TouchableOpacity
        style={styles.editPill}
        onPress={() => onEdit(item)}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Text style={styles.editPillText}>Edit</Text>
      </TouchableOpacity>

      {/* Circle toggle — inner touchable captures its own press, won't bubble up */}
      <TouchableOpacity
        style={checked ? [styles.circle, styles.circleChecked] : styles.circle}
        onPress={() => onToggle(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {checked ? <Text style={styles.circleCheck}>✓</Text> : null}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ── App ────────────────────────────────────────────── */
export default function App() {
  const [items, setItems]           = useState([]);
  const [input, setInput]           = useState('');
  const [editTarget, setEditTarget] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/items`);
      const data = await res.json();
      setItems(data);
    } catch { /* silent — backend not reachable */ }
  }, []);

  useEffect(() => {
    fetchItems();
    const id = setInterval(fetchItems, 3000);
    return () => clearInterval(id);
  }, [fetchItems]);

  const addItem = async () => {
    if (!input.trim()) return;
    try {
      await fetch(`${API}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: input.trim() }),
      });
      setInput('');
      fetchItems();
    } catch {
      Alert.alert('Error', 'Could not connect to the backend.');
    }
  };

  const toggleItem = async (item) => {
    await fetch(`${API}/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked: !item.checked }),
    });
    fetchItems();
  };

  const saveEdit = async (id, name) => {
    await fetch(`${API}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setEditTarget(null);
    fetchItems();
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Delete Item',
      `Remove "${item.name}" from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
      ],
    );
  };

  const deleteItem = async (id) => {
    await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const checkedCount = items.filter((i) => Boolean(i.checked)).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" backgroundColor={YELLOW} />

      <EditModal
        item={editTarget}
        onSave={saveEdit}
        onCancel={() => setEditTarget(null)}
      />

      {/* Yellow header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Shopping List.</Text>
      </View>

      {/* White content card */}
      <View style={styles.card}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>
            {'Items '}
            <Text style={styles.statsCount}>({items.length})</Text>
          </Text>
          {items.length > 0 ? (
            <Text style={styles.statsDone}>{checkedCount} done</Text>
          ) : null}
        </View>

        {/* Add input */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={input}
            onChangeText={setInput}
            placeholder="Add a new item…"
            placeholderTextColor={GRAY}
            onSubmitEditing={addItem}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* List */}
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧺</Text>
            <Text style={styles.emptyText}>Your list is empty</Text>
            <Text style={styles.emptyHint}>Add the first item above</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <ItemRow
                item={item}
                index={index}
                onToggle={toggleItem}
                onEdit={setEditTarget}
                onDelete={confirmDelete}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: YELLOW,
  },

  header: {
    backgroundColor: YELLOW,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: BLACK,
    letterSpacing: -0.5,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
  },
  statsCount: {
    color: GRAY,
    fontWeight: '400',
    fontSize: 16,
  },
  statsDone: {
    fontSize: 13,
    color: GRAY,
  },

  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  addInput: {
    flex: 1,
    height: 46,
    backgroundColor: LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: BLACK,
  },
  addBtn: {
    width: 46,
    height: 46,
    backgroundColor: YELLOW,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 26,
    fontWeight: '700',
    color: BLACK,
    lineHeight: 30,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
  },

  list: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
    width: 24,
    textAlign: 'right',
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
  },
  itemNameDone: {
    textDecorationLine: 'line-through',
    color: GRAY,
    fontWeight: '400',
  },

  editPill: {
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: YELLOW,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A6800',
  },

  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleChecked: {
    backgroundColor: YELLOW,
    borderColor: YELLOW,
  },
  circleCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: BLACK,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: GRAY,
  },

  /* Edit Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BLACK,
    marginBottom: 16,
  },
  modalInput: {
    height: 50,
    backgroundColor: LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: BLACK,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: YELLOW,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    color: BLACK,
    fontWeight: '800',
  },
});
