"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getDeviceId } from "./device";
import { DbUser, getUserByDeviceId } from "./user-service";

interface UserContextValue {
  /** 현재 로그인된 유저 (null이면 미로그인) */
  user: DbUser | null;
  /** 유저 데이터 로딩 중 */
  isLoading: boolean;
  /** 유저 데이터 새로고침 (DB에서 다시 읽기) */
  refreshUser: () => Promise<void>;
  /** 유저 설정 (닉네임 생성 후 호출) */
  setUser: (user: DbUser) => void;
  /** 낙관적 업데이트 (DB 쓰기와 동시에 context 즉시 반영) */
  patchUser: (updates: Partial<DbUser>) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  setUser: () => {},
  patchUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const dbUser = await getUserByDeviceId(deviceId);
    setUser(dbUser);
    setIsLoading(false);
  }, []);

  const patchUser = useCallback((updates: Partial<DbUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser, setUser, patchUser }}>
      {children}
    </UserContext.Provider>
  );
}
