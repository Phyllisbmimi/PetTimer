import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Pet } from '../types';

// 寵物狀態管理 Hook
export function usePetState(petId: string) {
  const { currentPet, updatePetStats } = useAppStore();
  const [pet, setPet] = useState<Pet | null>(currentPet);

  useEffect(() => {
    setPet(currentPet);
  }, [currentPet]);

  // 自動增加飢餓值
  useEffect(() => {
    if (!pet) return;

    const interval = setInterval(() => {
      const newHunger = Math.min(100, pet.hunger + 1);
      const newEnergy = Math.max(0, pet.energy - 0.5);

      updatePetStats(petId, {
        hunger: newHunger,
        energy: newEnergy,
      });
    }, 5000); // 每 5 秒增加

    return () => clearInterval(interval);
  }, [pet, petId, updatePetStats]);

  return { pet, updatePetStats };
}

// 番茄鐘 Hook
export function usePomodoro(duration: number = 25, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsCompleted(true);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    timeLeft,
    minutes,
    seconds,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    progress: (duration * 60 - timeLeft) / (duration * 60),
  };
}

// 目標進度計算 Hook
export function useGoalProgress(goal: any) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!goal.subtasks || goal.subtasks.length === 0) {
      setProgress(goal.progress || 0);
      return;
    }

    const totalWeight = goal.subtasks.reduce((sum: number, t: any) => sum + (t.weight || 1), 0);
    const completedWeight = goal.subtasks
      .filter((t: any) => t.completed)
      .reduce((sum: number, t: any) => sum + (t.weight || 1), 0);

    const calculatedProgress = Math.round((completedWeight / totalWeight) * 100);
    setProgress(calculatedProgress);
  }, [goal]);

  return progress;
}

// 簽到連續天數 Hook
export function useCheckInStreak(checkIns: any) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (checkIns.length === 0) {
      setStreak(0);
      return;
    }

    const sortedCheckIns = [...checkIns].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  }, [checkIns]);

  return streak;
}

// 寵物反應 Hook
export function usePetReaction() {
  const [reaction, setReaction] = useState<string>('');
  const [isReacting, setIsReacting] = useState(false);

  const petReactions = {
    happy: ['汪汪！😄', '喵喵~😸', '呃呃~🦊'],
    hungry: ['嗚...🥺', '餓餓...😢'],
    sleepy: ['呼呼...😴', '好睏..💤'],
  };

  const showReaction = (type: 'happy' | 'hungry' | 'sleepy') => {
    const reactions = petReactions[type];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setReaction(randomReaction);
    setIsReacting(true);

    setTimeout(() => {
      setIsReacting(false);
    }, 2000);
  };

  return { reaction, isReacting, showReaction };
}
