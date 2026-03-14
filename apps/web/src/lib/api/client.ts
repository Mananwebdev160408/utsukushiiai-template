/**
 * Simulated API Client for UtsukushiiAI
 * Provides fake async calls with console logging for development.
 */

const DELAY = 800;



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type BackendResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
};

const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('utsukushii-auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getAccessToken = () => getStoredAuth()?.state?.tokens?.accessToken || null;

const persistAuth = (user: any, tokens: { accessToken: string; refreshToken: string }) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    'utsukushii-auth',
    JSON.stringify({
      state: {
        user,
        tokens,
        isAuthenticated: true,
      },
      version: 0,
    }),
  );
};

const clearAuth = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('utsukushii-auth');
};

const request = async <T>(path: string, init?: RequestInit): Promise<BackendResponse<T>> => {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  return body;
};

const ANIME_AVATARS = [
  'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952ad4874062.jpg', // Gojo
  'https://i.pinimg.com/736x/2b/37/60/2b3760990426c6d05908e063806f477e.jpg', // Rengoku
  'https://i.pinimg.com/736x/55/9b/6e/559b6e224e2cda31862cd2f2e519c5c9.jpg', // Ichigo
  'https://i.pinimg.com/736x/77/3b/68/773b680589a8a705663738e4618e404b.jpg', // Luffy
  'https://i.pinimg.com/736x/e4/1d/9b/e41d9b32af26f8d30e998a96677b102c.jpg', // Ken Kaneki
];

const getCharacterAvatar = (seed: string) => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ANIME_AVATARS[hash % ANIME_AVATARS.length];
};

const mapUser = (user: any) => {
  if (!user) return null;
  const name = user.displayName || user.name || user.username || (user.email ? user.email.split('@')[0] : 'Utsukushii User');
  return {
    id: user._id || user.id,
    name,
    email: user.email,
    avatar: user.avatarUrl || getCharacterAvatar(name),
    tier: 'pro' as const,
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

const mapProjectStatus = (status?: string) => {
  switch (status) {
    case 'ready':
      return 'completed';
    case 'draft':
      return 'idle';
    default:
      return status || 'idle';
  }
};

const parseResolution = (resolution?: string) => {
  const [width, height] = (resolution || '1080x1920').split('x').map((value) => parseInt(value, 10));
  return { width: width || 1080, height: height || 1920 };
};

const mapProject = (project: any) => {
  const resolution = parseResolution(project?.settings?.resolution);
  return {
    id: project._id || project.id,
    title: project.title,
    description: project.description,
    status: mapProjectStatus(project.status),
    lastUpdated: project.updatedAt || project.createdAt || new Date().toISOString(),
    createdAt: project.createdAt || new Date().toISOString(),
    aspectRatio: project.aspectRatio,
    image: project.mangaChapters?.[0]?.fileUrl,
    mangaPages: (project.mangaChapters || []).map((chapter: any, index: number) => ({
      id: chapter.id,
      url: chapter.fileUrl,
      filename: chapter.originalName,
      width: chapter.width || resolution.width,
      height: chapter.height || resolution.height,
      pageNumber: chapter.chapterNumber || index + 1,
    })),
    audioInfo: project.audioInfo
      ? {
          id: project.audioInfo.id || `${project._id || project.id}_audio`,
          url: project.audioInfo.fileUrl,
          filename: project.audioInfo.originalName,
          duration: project.audioInfo.duration || 0,
          bpm: project.audioInfo.bpm,
        }
      : undefined,
    settings: {
      quality: project.settings?.quality || 'high',
      fps: project.settings?.fps || 30,
      width: resolution.width,
      height: resolution.height,
      codec: 'libx264',
      effects: {
        parallax: true,
        glow: true,
        zoom: true,
        animation: true,
        wiggle: false,
        textOverlay: false,
      },
      transition: 'fade',
      transitionDuration: 0.5,
    },
  };
};

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await request<any>('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = response.data || {};
      const user = mapUser(data.user);
      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };

      persistAuth(user, tokens);

      return {
        success: true,
        data: {
          user,
          token: tokens.accessToken,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    },
    register: async (userData: { name: string; email: string; password: string }) => {
      const baseUsername = userData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      const payload = {
        email: userData.email,
        password: userData.password,
        username: baseUsername || `user_${Date.now()}`,
        displayName: userData.name,
      };

      const response = await request<any>('/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = response.data || {};
      const user = mapUser(data.user);
      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };

      persistAuth(user, tokens);

      return {
        success: true,
        data: {
          user,
          token: tokens.accessToken,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    },
    me: async () => {
      const response = await request<any>('/v1/auth/me');
      const userData = response.data?.user || response.data;
      return {
        success: true,
        data: mapUser(userData),
      };
    },
    logout: async () => {
      const refreshToken = getStoredAuth()?.state?.tokens?.refreshToken;
      try {
        if (refreshToken) {
          await request('/v1/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
        }
      } finally {
        clearAuth();
      }
      return { success: true };
    },
  },
  projects: {
    list: async () => {
      const response = await request<any>('/v1/projects');
      return {
        success: true,
        data: (response.data?.projects || []).map(mapProject),
      };
    },
    get: async (id: string) => {
      const response = await request<any>(`/v1/projects/${id}`);
      return {
        success: true,
        data: mapProject(response.data?.project),
      };
    },
    create: async (projectData: { title: string; description?: string; aspectRatio?: string }) => {
      const response = await request<any>('/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      return {
        success: true,
        data: mapProject(response.data?.project),
      };
    },
    update: async (id: string, updates: { title?: string; description?: string; settings?: any }) => {
      const response = await request<any>(`/v1/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return {
        success: true,
        data: mapProject(response.data?.project),
      };
    },
    delete: async (id: string) => {
      await request(`/v1/projects/${id}`, { method: 'DELETE' });
      return { success: true };
    },
  },
  assets: {
    upload: async (
      file: File,
      type: 'manga' | 'audio',
      chapterInfo?: { number: number; title?: string },
      projectId?: string,
    ) => {
      if (!projectId) {
        throw new Error('Project must exist before uploading assets');
      }

      const token = getAccessToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      if (chapterInfo?.number) {
        formData.append('chapterNumber', String(chapterInfo.number));
      }
      if (chapterInfo?.title) {
        formData.append('chapterTitle', chapterInfo.title);
      }

      const response = await fetch(`${API_BASE_URL}/v1/upload/file/${type}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const text = await response.text();
      const body = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(body?.message || `Upload failed: ${response.status}`);
      }

      return {
        success: true,
        data: {
          id: body.data?.id,
          url: body.data?.fileUrl,
          chapterNumber: body.data?.chapterNumber,
          chapterTitle: body.data?.chapterTitle,
        },
      };
    },
  },
};
