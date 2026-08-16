// LRC 风格歌词解析：支持管理后台在每行开头填写 [mm:ss.xx] 时间戳。
// 未带时间戳的歌词仍按纯文本处理，由调用方决定展示方式。
export type LyricLine = {
  time: number | null;
  text: string;
};

const TIMESTAMP_PATTERN = /\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;

function parseSeconds(value: string): number {
  const normalized = value.replace(":", ".");
  const seconds = Number(normalized);
  return Number.isFinite(seconds) ? seconds : 0;
}

export function parseLyrics(lyrics: string | null | undefined): LyricLine[] {
  if (!lyrics) return [];

  const lines: LyricLine[] = [];
  for (const rawLine of lyrics.split(/\r?\n/)) {
    const pattern = new RegExp(TIMESTAMP_PATTERN.source, "g");
    const matches = [...rawLine.matchAll(pattern)];
    if (matches.length === 0) {
      lines.push({ time: null, text: rawLine.trim() });
      continue;
    }

    const text = rawLine.replace(pattern, "").trim();
    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = parseSeconds(match[2]);
      lines.push({ time: minutes * 60 + seconds, text });
    }
  }

  // 时间戳行按时间排序；无时间戳的元信息行保持在最前面。
  return lines.sort((left, right) => {
    const leftTime = left.time ?? -1;
    const rightTime = right.time ?? -1;
    return leftTime - rightTime;
  });
}

export function hasTimedLyrics(lines: LyricLine[]): boolean {
  return lines.some((line) => line.time !== null);
}

export function getActiveLyricIndex(
  lines: LyricLine[],
  currentTime: number
): number {
  let activeIndex = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const time = lines[index].time;
    if (time === null) continue;
    if (time <= currentTime) {
      activeIndex = index;
    } else {
      break;
    }
  }
  return activeIndex;
}
