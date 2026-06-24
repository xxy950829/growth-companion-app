// 用户类型
export interface User {
  uid: string;
  email: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// 宝宝类型
export interface Baby {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  birthday: number; // 时间戳
  avatarUrl?: string;
  createdAt: number;
}

export * from './archive';
export * from './planet';
export * from './weather';
