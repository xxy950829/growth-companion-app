// 表单验证器

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码至少6位' };
  }
  return { valid: true };
}

export function validateBabyName(name: string): { valid: boolean; message?: string } {
  if (!name.trim()) {
    return { valid: false, message: '请输入宝宝昵称' };
  }
  if (name.length > 20) {
    return { valid: false, message: '昵称不超过20个字符' };
  }
  return { valid: true };
}

export function validateBirthday(birthday: number): { valid: boolean; message?: string } {
  if (!birthday) {
    return { valid: false, message: '请选择宝宝生日' };
  }
  if (birthday > Date.now()) {
    return { valid: false, message: '生日不能晚于今天' };
  }
  // 不能超过 18 岁
  const maxAge = Date.now() - 18 * 365 * 24 * 3600 * 1000;
  if (birthday < maxAge) {
    return { valid: false, message: '请确认生日正确' };
  }
  return { valid: true };
}
