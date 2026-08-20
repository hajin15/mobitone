import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mobitone:playlist';

export type Track = {
  id: string;
  videoId: string;
  title: string;
  artist: string;
};

function loadTracks(): Track[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

    // 저장값이 손상됐을 수 있으니 모양을 확인하고 받습니다.
    return Array.isArray(saved) ? saved.filter((item) => typeof item?.videoId === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * 주소만으로 제목/채널명을 알려주는 유튜브 공개 창구(oEmbed).
 * API 키가 필요 없습니다. 실패하면 null 을 돌려주고 부르는 쪽에서 대체합니다.
 */
async function fetchTrackInfo(videoId: string): Promise<{ title: string; artist: string } | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return { title: data.title ?? '', artist: data.author_name ?? '' };
  } catch {
    // 인터넷이 끊겼거나 비공개 영상인 경우
    return null;
  }
}

export function usePlaylist() {
  const [tracks, setTracks] = useState<Track[]>(loadTracks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  }, [tracks]);

  /** 이미 담긴 곡이면 다시 넣지 않습니다. */
  const has = useCallback(
    (videoId: string) => tracks.some((track) => track.videoId === videoId),
    [tracks],
  );

  const add = useCallback((track: Omit<Track, 'id'>) => {
    setTracks((list) => {
      if (list.some((item) => item.videoId === track.videoId)) return list;
      return [...list, { ...track, id: crypto.randomUUID() }];
    });
  }, []);

  /** 주소로 추가. 제목은 oEmbed 로 채우고, 못 가져오면 영상 ID 를 대신 씁니다. */
  const addByVideoId = useCallback(
    async (videoId: string) => {
      const info = await fetchTrackInfo(videoId);

      add({
        videoId,
        title: info?.title || videoId,
        artist: info?.artist || '가수 이름',
      });
    },
    [add],
  );

  const remove = useCallback((id: string) => {
    setTracks((list) => list.filter((item) => item.id !== id));
  }, []);

  return { tracks, has, add, addByVideoId, remove };
}
