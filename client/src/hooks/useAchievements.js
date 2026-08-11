import { useMemo, useEffect, useRef } from "react";

const UNLOCKED_KEY = "screenvault_unlocked_badges";

export const BADGE_DEFINITIONS = [
  {
    id: "first_title",
    title: "First Step",
    emoji: "🍿",
    description: "Save your first movie or TV show to your library.",
    target: 1,
  },
  {
    id: "planner",
    title: "Planner Ahead",
    emoji: "🎯",
    description: "Add 5 titles to your 'To Watch' list.",
    target: 5,
  },
  {
    id: "binge_rookie",
    title: "Binge Rookie",
    emoji: "📺",
    description: "Finish watching at least 1 TV series.",
    target: 1,
  },
  {
    id: "cinephile_apprentice",
    title: "Cinephile Apprentice",
    emoji: "🎬",
    description: "Finish watching 5 movies.",
    target: 5,
  },
  {
    id: "movie_buff",
    title: "Movie Buff",
    emoji: "🏆",
    description: "Finish watching 25 movies.",
    target: 25,
  },
  {
    id: "critical_thinker",
    title: "Critical Thinker",
    emoji: "🌟",
    description: "Write personal reviews/ratings for 5 titles.",
    target: 5,
  },
  {
    id: "curator",
    title: "Curator",
    emoji: "📁",
    description: "Create 2 custom collections/playlists.",
    target: 2,
  },
  {
    id: "time_traveler",
    title: "Time Traveler",
    emoji: "🕰️",
    description: "Finish a movie or show released before the year 2000.",
    target: 1,
  },
  {
    id: "masterpiece",
    title: "Masterpiece Lover",
    emoji: "🔥",
    description: "Give a perfect 10/10 rating to a title.",
    target: 1,
  },
  {
    id: "master_collector",
    title: "Master Collector",
    emoji: "👑",
    description: "Have 50 or more total titles in your library.",
    target: 50,
  },
];

export function useAchievements(library = [], collections = [], toast) {
  const previousUnlockedRef = useRef(new Set());

  // Load previously unlocked badge IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(UNLOCKED_KEY);
      if (stored) {
        previousUnlockedRef.current = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error("[useAchievements] Storage error:", e);
    }
  }, []);

  const achievements = useMemo(() => {
    const finishedItems = library.filter((i) => i.status === "finished");
    const toWatchItems = library.filter((i) => i.status === "to_watch");
    const moviesFinished = finishedItems.filter((i) => i.mediaType === "movie" || i.title);
    const tvFinished = finishedItems.filter((i) => i.mediaType === "tv" || (!i.title && i.name));
    const ratedItems = library.filter((i) => i.userRating !== null && i.userRating !== undefined);
    const pre2000Finished = finishedItems.filter((i) => {
      const yearStr = (i.release_date || i.first_air_date)?.split("-")[0];
      return yearStr && Number(yearStr) < 2000;
    });
    const perfectTens = ratedItems.filter((i) => Number(i.userRating) === 10);

    return BADGE_DEFINITIONS.map((b) => {
      let currentProgress = 0;
      switch (b.id) {
        case "first_title":
          currentProgress = library.length;
          break;
        case "planner":
          currentProgress = toWatchItems.length;
          break;
        case "binge_rookie":
          currentProgress = tvFinished.length;
          break;
        case "cinephile_apprentice":
        case "movie_buff":
          currentProgress = moviesFinished.length;
          break;
        case "critical_thinker":
          currentProgress = ratedItems.length;
          break;
        case "curator":
          currentProgress = collections.length;
          break;
        case "time_traveler":
          currentProgress = pre2000Finished.length;
          break;
        case "masterpiece":
          currentProgress = perfectTens.length;
          break;
        case "master_collector":
          currentProgress = library.length;
          break;
        default:
          currentProgress = 0;
      }

      const unlocked = currentProgress >= b.target;
      return {
        ...b,
        currentProgress: Math.min(currentProgress, b.target),
        unlocked,
      };
    });
  }, [library, collections]);

  // Check for newly unlocked badges and trigger toast alerts
  useEffect(() => {
    const newlyUnlocked = [];
    const currentUnlockedIds = new Set();

    achievements.forEach((b) => {
      if (b.unlocked) {
        currentUnlockedIds.add(b.id);
        if (!previousUnlockedRef.current.has(b.id)) {
          newlyUnlocked.push(b);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((badge) => {
        toast?.(`🏆 Achievement Unlocked: ${badge.title} ${badge.emoji}!`, "success");
      });
      previousUnlockedRef.current = currentUnlockedIds;
      try {
        localStorage.setItem(UNLOCKED_KEY, JSON.stringify(Array.from(currentUnlockedIds)));
      } catch (e) {
        console.error("[useAchievements] Storage save error:", e);
      }
    }
  }, [achievements, toast]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return {
    achievements,
    unlockedCount,
    totalBadges: BADGE_DEFINITIONS.length,
  };
}
