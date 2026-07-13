import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS } from '@/utils/constants';
import { showDialog } from '@/stores/uiStore';
import { MILESTONE_TYPE_CONFIG, SELECTABLE_MILESTONE_TYPES } from '@/types/archive';
import type { Milestone, MilestoneType } from '@/types';
import { pickImage, takePhoto, uploadImage } from '@/services/storage';
import { formatDate } from '@/utils/helpers';

interface MilestoneFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Milestone, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
}

export function MilestoneForm({ visible, onClose, onSubmit }: MilestoneFormProps) {
  const [type, setType] = useState<MilestoneType>('first_milestone');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(Date.now());
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 每次打开表单时重置状态，避免上次数据残留
  useEffect(() => {
    if (visible) reset();
  }, [visible]);

  const reset = () => {
    setType('first_milestone');
    setTitle('');
    setDescription('');
    setDate(Date.now());
    setMediaUrls([]);
    setTags([]);
    setTagInput('');
    setHeight('');
    setWeight('');
    setVaccineName('');
  };

  // 选择并上传图片：上传到后端 COS，失败则保留本地 URI
  const pickAndUpload = async (source: 'camera' | 'library') => {
    try {
      const localUri = source === 'camera' ? await takePhoto() : await pickImage();
      if (!localUri) return;
      setUploading(true);
      const cloudUrl = await uploadImage(localUri, `milestones/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`);
      setMediaUrls((prev) => [...prev, cloudUrl]);
    } catch (e) {
      // 忽略权限错误
    } finally {
      setUploading(false);
    }
  };

  const showImagePicker = () => {
    showDialog('添加照片', '请选择来源', [
      { text: '拍照', onPress: () => pickAndUpload('camera'), variant: 'primary' },
      { text: '相册', onPress: () => pickAndUpload('library'), variant: 'primary' },
      { text: '取消' },
    ]);
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const adjustDate = (field: 'year' | 'month' | 'day', delta: number) => {
    const d = new Date(date);
    if (field === 'year') d.setFullYear(d.getFullYear() + delta);
    if (field === 'month') d.setMonth(d.getMonth() + delta);
    if (field === 'day') d.setDate(d.getDate() + delta);
    setDate(d.getTime());
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const data: Omit<Milestone, 'id' | 'createdAt' | 'createdBy'> = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        mediaUrls,
        tags,
        ...(type === 'measurement'
          ? {
              height: height ? Number(height) : undefined,
              weight: weight ? Number(weight) : undefined,
            }
          : {}),
        ...(type === 'vaccine'
          ? {
              vaccineName: vaccineName.trim() || undefined,
            }
          : {}),
      };
      await onSubmit(data);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const dateStr = formatDate(date);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="记录成长时刻"
      style={{ maxHeight: '90%' }}
      footer={
        <>
          <Button title="取消" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
          <Button
            title="保存"
            onPress={handleSubmit}
            loading={submitting}
            style={{ flex: 1 }}
            disabled={!title.trim()}
          />
        </>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>里程碑类型</Text>
        <View style={styles.typeGrid}>
          {SELECTABLE_MILESTONE_TYPES.map((t) => {
            const cfg = MILESTONE_TYPE_CONFIG[t];
            const active = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeItem,
                  active && { backgroundColor: cfg.color + '20', borderColor: cfg.color },
                ]}
                onPress={() => setType(t)}
              >
                <Text style={styles.typeIcon}>{cfg.icon}</Text>
                <Text style={[styles.typeLabel, active && { color: cfg.color }]}>{cfg.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="标题"
          placeholder="给这个时刻起个名字"
          value={title}
          onChangeText={setTitle}
          maxLength={30}
        />

        <Input
          label="描述（选填）"
          placeholder="记录下当时的心情和细节..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />

        {/* 身高体重特有 */}
        {type === 'measurement' && (
          <View style={styles.row}>
            <Input
              label="身高(cm)"
              placeholder="如 75"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              containerStyle={{ flex: 1, marginRight: 6 }}
            />
            <Input
              label="体重(kg)"
              placeholder="如 9.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              containerStyle={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        )}

        {/* 疫苗特有 */}
        {type === 'vaccine' && (
          <Input
            label="疫苗名称"
            placeholder="如 乙肝疫苗第一针"
            value={vaccineName}
            onChangeText={setVaccineName}
          />
        )}

        <Text style={styles.label}>日期</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('day', -1)}>
            <Text style={styles.dateBtnText}>前一天</Text>
          </TouchableOpacity>
          <Text style={styles.dateStr}>{dateStr}</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate('day', 1)}>
            <Text style={styles.dateBtnText}>后一天</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>照片（选填）</Text>
        <View style={styles.imageRow}>
          {mediaUrls.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.image} />
          ))}
          <TouchableOpacity style={styles.addImage} onPress={showImagePicker} disabled={uploading}>
            <Text style={styles.addImageText}>{uploading ? '上传中...' : '+ 添加'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>标签（选填）</Text>
        <View style={styles.tagInputRow}>
          <Input
            placeholder="输入标签后回车"
            value={tagInput}
            onChangeText={setTagInput}
            containerStyle={{ flex: 1, marginRight: 6, marginBottom: 0 }}
            onSubmitEditing={handleAddTag}
          />
          <Button title="添加" variant="ghost" size="sm" onPress={handleAddTag} />
        </View>
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={styles.tag}
                onPress={() => setTags(tags.filter((_, idx) => idx !== i))}
              >
                <Text style={styles.tagText}>#{t} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: COLORS.ink,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeItem: {
    width: '31%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
    alignItems: 'center',
    backgroundColor: COLORS.bg2,
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },
  row: {
    flexDirection: 'row',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg2,
    borderRadius: 12,
    padding: 10,
  },
  dateBtn: {
    padding: 6,
  },
  dateBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  dateStr: {
    fontSize: 14,
    color: COLORS.ink,
    fontWeight: '600',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  addImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.rule,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg2,
  },
  addImageText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.accent,
  },
});
