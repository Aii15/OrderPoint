// CATATAN: Counter in-memory ini reset saat server restart/hot-reload,
// dan tidak aman untuk deployment multi-instance. Pindahkan ke database
// (via apps/api) begitu backend sudah dibangun.

interface QueueCounterState {
  dateKey: string;
  counter: number;
}

const state: QueueCounterState = {
  dateKey: '',
  counter: 0,
};

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

export function getNextQueueNumber(): string {
  const todayKey = getDateKey();

  if (state.dateKey !== todayKey) {
    state.dateKey = todayKey;
    state.counter = 0;
  }

  state.counter += 1;

  const letter = String.fromCharCode(65 + Math.floor((state.counter - 1) / 100));
  const number = ((state.counter - 1) % 100) + 1;

  return `${letter}-${number.toString().padStart(3, '0')}`;
}