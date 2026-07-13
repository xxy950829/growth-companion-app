// 存储服务 - 图片选择与上传
// 上传走后端 /api/upload，后端再上传到腾讯云 COS
// RN 环境下用 fetch + FormData 上传文件

import * as ImagePicker from 'expo-image-picker';
import { getAccessToken, BASE_URL } from './api';

// 从相册选图
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

// 拍照
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

// 上传图片到后端，返回可访问的 URL
// path 参数用于区分用途（avatar/image），实际存储路径由后端决定
export async function uploadImage(localUri: string, path: string): Promise<string> {
  // 根据路径判断上传接口
  const endpoint = path.includes('avatar') ? '/avatar' : '/image';
  const url = `${BASE_URL}/upload${endpoint}`;

  const token = await getAccessToken();
  if (!token) {
    // 未登录时返回本地 URI
    return localUri;
  }

  // RN 用 fetch + FormData 上传文件
  const formData = new FormData();
  // @ts-expect-error RN 环境下 URI 可直接作为文件对象
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const json = await res.json();
    if (json.code === 0 && json.data?.url) {
      // 后端返回相对路径时拼接 baseUrl
      const returnUrl = json.data.url;
      if (returnUrl.startsWith('http')) return returnUrl;
      return `${BASE_URL.replace('/api', '')}${returnUrl}`;
    }
    console.warn('[Storage] 上传失败，回退本地 URI:', json.message);
    return localUri;
  } catch (e) {
    console.warn('[Storage] 上传请求失败，回退本地 URI:', e);
    return localUri;
  }
}
