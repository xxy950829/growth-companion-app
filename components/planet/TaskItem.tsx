import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  completed: boolean;
  onComplete: () => void;
  onUncomplete: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
}

export function TaskItem({ task, completed, onComplete, onUncomplete, onToggle, onDelete }: TaskItemProps) {
  return (
    <Card style={[styles.card, !task.isActive && styles.inactive]}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.checkbox, completed && styles.checkboxDone]}
          onPress={completed ? onUncomplete : onComplete}
          disabled={!task.isActive}
        >
          {completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </TouchableOpacity>

        <Text style={styles.icon}>{task.icon}</Text>

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, completed && styles.nameDone, !task.isActive && styles.inactiveText]}>
            {task.name}
          </Text>
          <View style={styles.metaRow}>
            {task.schedule.length > 0 ? (
              <Text style={styles.schedule}>⏰ {task.schedule.join(' · ')}</Text>
            ) : (
              <Text style={styles.schedule}>随时</Text>
            )}
            <Text style={styles.points}>+{task.points} 经验</Text>
          </View>
        </View>

        {onToggle && (
          <TouchableOpacity onPress={onToggle} style={styles.actionBtn}>
            <Text style={styles.actionText}>{task.isActive ? '暂停' : '启用'}</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: COLORS.danger }]}>删除</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 14,
  },
  inactive: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.rule,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxDone: {
    backgroundColor: COLORS.accent2,
    borderColor: COLORS.accent2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.ink,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    color: COLORS.muted,
  },
  inactiveText: {
    color: COLORS.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  schedule: {
    fontSize: 12,
    color: COLORS.muted,
  },
  points: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.muted,
  },
});
