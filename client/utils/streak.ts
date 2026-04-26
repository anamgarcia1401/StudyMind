type StreakData = {
  lastActive: string;
  streak: number;
};

export const getStreak = (): number => {
  try {
    const saved = localStorage.getItem("streakData");
    if (!saved) return 0;
    
    const data: StreakData = JSON.parse(saved);
    const lastActive = data.lastActive;
    const streak = data.streak || 0;
    
    if (!lastActive) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActive === today) {
      return streak;
    } else if (lastActive === yesterdayStr) {
      return streak;
    } else {
      return 0;
    }
  } catch (e) {
    return 0;
  }
};

export const markActiveDay = (): void => {
  try {
    const saved = localStorage.getItem("streakData");
    const today = new Date().toISOString().split('T')[0];
    let streak = 1;
    
    if (saved) {
      const data: StreakData = JSON.parse(saved);
      const lastActive = data.lastActive;
      const currentStreak = data.streak || 0;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActive === yesterdayStr) {
        streak = currentStreak + 1;
      } else if (lastActive === today) {
        streak = currentStreak;
      } else {
        streak = 1;
      }
    }
    
    localStorage.setItem("streakData", JSON.stringify({
      lastActive: today,
      streak: streak
    }));
    
    window.dispatchEvent(new Event("streakUpdated"));
  } catch (e) {
    console.error("Error saving streak:", e);
  }
};