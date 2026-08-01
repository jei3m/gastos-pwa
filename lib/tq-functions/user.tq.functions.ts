import { UserDataExport } from '@/types/user.types';

export const fetchUserDataExport = async () => {
  try {
    const res = await fetch('/api/export', {
      method: 'GET',
    });
    const data = await res.json();
    if (!data.success) {
      throw Error(data.message);
    }
    return data.data as UserDataExport;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
    throw Error('Failed to Export Data');
  }
};
