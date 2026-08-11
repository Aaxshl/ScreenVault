export const MOVIE_GENRES = [
  { id: 28,    name: "Action"    },
  { id: 35,    name: "Comedy"    },
  { id: 18,    name: "Drama"     },
  { id: 27,    name: "Horror"    },
  { id: 878,   name: "Sci-Fi"    },
  { id: 10749, name: "Romance"   },
  { id: 16,    name: "Animation" },
  { id: 53,    name: "Thriller"  },
  { id: 80,    name: "Crime"     },
  { id: 12,    name: "Adventure" },
];

export const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 35,    name: "Comedy"             },
  { id: 18,    name: "Drama"              },
  { id: 9648,  name: "Mystery"            },
  { id: 10765, name: "Sci-Fi & Fantasy"   },
  { id: 10768, name: "War & Politics"     },
  { id: 16,    name: "Animation"          },
  { id: 80,    name: "Crime"              },
  { id: 10764, name: "Reality"            },
  { id: 10767, name: "Talk"               },
];

export const YEARS = Array.from({ length: 30 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

export const SORT_OPTIONS = [
  { value: "popularity.desc",     label: "Most Popular"   },
  { value: "vote_average.desc",   label: "Top Rated"      },
  { value: "release_date.desc",   label: "Newest First"   },
  { value: "release_date.asc",    label: "Oldest First"   },
];

export const RATING_OPTIONS = [
  { value: "",  label: "Any Rating" },
  { value: "9", label: "9+ ⭐"      },
  { value: "8", label: "8+ ⭐"      },
  { value: "7", label: "7+ ⭐"      },
  { value: "6", label: "6+ ⭐"      },
];
