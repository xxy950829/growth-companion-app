import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS } from '@/utils/constants';
import { WEATHER_CONFIG, TEMPERATURE_CONFIG } from '@/types/weather';
import type { WeatherType, Temperature, MoodRecord } from '@/types';

interface MoodFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    weather: WeatherType;
    temperature: Temperature;
    note?: string;
    date: number;
  }) => Promise<void>;
}

export function MoodForm({ visible, onClose, onSubmit }: MoodFormProps) {
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [temperature, setTemperature] = useState<Temperature>('warm');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setWeather('sunny');
    setTemperature('warm');
    setNote('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        weather,
        temperature,
        note: note.trim() || undefined,
        date: Date.now(),
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
      title="今天心情怎么样？"
      footer={
        <>
          <Button title="取消" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
          <Button title="保存" onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>选择天气</Text>
        <View style={styles.weatherGrid}>
          {(Object.keys(WEATHER_CONFIG) as WeatherType[]).map((w) => {
            const cfg = WEATHER_CONFIG[w];
            const active = weather === w;
            return (
              <TouchableOpacity
                key={w}
                style={[
                  styles.weatherItem,
                  active && { backgroundColor: cfg.color + '30', borderColor: cfg.color },
                ]}
                onPress={() => setWeather(w)}
              >
                <Text style={styles.weatherIcon}>{cfg.icon}</Text>
                <Text style={styles.weatherLabel}>{cfg.label}</Text>
                <Text style={styles.weatherMood}>{cfg.mood}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>温度感受</Text>
        <View style={styles.tempRow}>
          {(Object.keys(TEMPERATURE_CONFIG) as Temperature[]).map((t) => {
            const cfg = TEMPERATURE_CONFIG[t];
            const active = temperature === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tempItem,
                  active && { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
                ]}
                onPress={() => setTemperature(t)}
              >
                <Text style={styles.tempIcon}>{cfg.icon}</Text>
                <Text style={[styles.tempLabel, active && { color: COLORS.accent }]}>{cfg.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="心情日记（选填）"
          placeholder="今天发生了什么？"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
          maxLength={200}
        />

        <Text style={styles.tip}>💡 用天气记录情绪，帮助宝宝认识自己的心情</Text>
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
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weatherItem: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
    alignItems: 'center',
    backgroundColor: COLORS.bg2,
  },
  weatherIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  weatherLabel: {
    fontSize: 13,
    color: COLORS.ink,
    fontWeight: '500',
  },
  weatherMood: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  tempRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tempItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
    alignItems: 'center',
    backgroundColor: COLORS.bg2,
  },
  tempIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tempLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  tip: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 12,
    lineHeight: 18,
  },
});
