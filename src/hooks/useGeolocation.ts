import { useState, useCallback } from 'react';

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = '이 브라우저는 위치 서비스를 지원하지 않습니다.';
        setState((prev) => ({ ...prev, error: msg, loading: false }));
        reject(new Error(msg));
        return;
      }

      setState({ lat: null, lng: null, error: null, loading: true });

      const onSuccess = (position: GeolocationPosition) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setState({ lat, lng, error: null, loading: false });
        resolve({ lat, lng });
      };

      const onError = (err: GeolocationPositionError) => {
        let msg = '위치를 가져오는 데 실패했습니다.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용해 주세요.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = '현재 위치를 확인할 수 없습니다. 네트워크 또는 GPS 상태를 확인해 주세요.';
        } else if (err.code === err.TIMEOUT) {
          msg = '위치 요청 시간이 초과되었습니다. 다시 시도해 주세요.';
        }
        setState({ lat: null, lng: null, error: msg, loading: false });
        reject(new Error(msg));
      };

      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (errLow) => {
          if (errLow.code === errLow.PERMISSION_DENIED) {
            onError(errLow);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
          );
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    });
  }, []);

  return { ...state, getLocation };
}
