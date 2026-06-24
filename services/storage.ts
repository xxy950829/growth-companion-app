// 存储服务 - 图片选择与上传
// 基于 CloudBase 云存储（CDN 加速），未启用时回退到本地 URI
// RN 环境下文件上传需使用 base64 编码（参考 CloudBase RN 适配器文档）

import * as ImagePicker from 'expo-image-picker';
// SDK 54 中旧版 API 移至 legacy 模块，readAsStringAsync 仍在 legacy 中可用
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { CLOUDBASE_ENABLED, app } from './cloudbase';

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('需要相册访问权限');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('需要相机权限');
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

// 读取本地文件为 base64 字符串
async function readAsBase64(uri: string): Promise<string> {
  return await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
}

// 上传文件到 CloudBase 云存储，未启用时返回本地 URI
// RN 环境下使用 base64 编码上传（参考 CloudBase RN 适配器文档）
export async function uploadImage(localUri: string, path: string): Promise<string> {
  if (!CLOUDBASE_ENABLED || !app) {
    return localUri;
  }
  try {
    // RN 环境下使用 base64 编码上传
    const base64Content = await readAsBase64(localUri);
    const uploadRes = await app.uploadFile({
      cloudPath: path,
      fileContent: base64Content,
      // @ts-expect-error RN 适配器需要 contentEncoding
      contentEncoding: 'base64',
    });
    // 获取 CDN 下载链接
    const urlRes = await app.getTempFileURL({
      fileList: [uploadRes.fileID],
    });
    const file = urlRes.fileList?.[0];
    return file?.tempFileURL || file?.download_url || localUri;
  } catch (e) {
    console.warn('CloudBase 上传失败，回退到本地 URI:', e);
    return localUri;
  }
}
