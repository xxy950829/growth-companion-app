import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { TASK_ICONS } from '@/types/planet';
import type { Task } from '@/types';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'isActive'>) => Promise<void>;
}

const TIME_SLOTS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export function TaskForm({ visible, onClose, onSubmit }: TaskFormProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(TASK_ICONS[0].icon);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [points, setPoints] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setIcon(TASK_ICONS[0].icon);
    setSchedule([]);
    setPoints('10');
  };

  const toggleTime = (t: string) => {
    setSchedule((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        schedule,
        points: Number(points) || 10,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="添加任务"
      footer={
        <>
          <Button title="取消" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
          <Button title="保存" onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} disabled={!name.trim()} />
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input label="任务名称" placeholder="如 喝奶、刷牙..." value={name} onChangeText={setName} maxLength={12} />

        <Text style={styles.label}>选择图标</Text>
        <View style={styles.iconGrid}>
          {TASK_ICONS.map((t) => {
            const active = icon === t.icon;
            return (
              <TouchableOpacity
                key={t.icon}
                style={[styles.iconItem, active && styles.iconItemActive]}
                onPress={() => setIcon(t.icon)}
              >
                <Text style={styles.iconEmoji}>{t.icon}</Text>
                <Text style={[styles.iconName, active && { color: COLORS.accent }]}>{t.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>计划时间（选填）</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((t) => {
            const active = schedule.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.timeItem, active && styles.timeItemActive]}
                onPress={() => toggleTime(t)}
              >
                <Text style={[styles.timeText, active && { color: '#FFFFFF' }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="积分奖励"
          placeholder="如 10"
          value={points}
          onChangeText={setPoints}
          keyboardType="numeric"
        />
        <Text style={styles.tip}>💡 完成任务可获得对应经验值，用于星球升级</Text>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: COLORS.ink,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconItem: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
    alignItems: 'center',
    backgroundColor: COLORS.bg2,
  },
  iconItemActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '15',
  },
  iconEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  iconName: {
    fontSize: 11,
    color: COLORS.muted,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.rule,
  },
  timeItemActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.ink,
  },
  tip: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 18,
  },
});
