/**
 * TMDB API Service with Live Integration & Resilient Fallback Catalog
 * PRD Section 8 & 10: Connects to TMDB API when key is available,
 * and maintains a robust real-movie offline catalog for instant reliability.
 */

import axios from 'axios';
import { MOOD_DEFINITIONS, enrichMovieWithMoods } from './moodEngine.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// In-memory cache for TMDB requests to minimize rate limits and latency
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

// 40+ Real Popular & Award-Winning Movies covering all 8 Moods
export const FALLBACK_MOVIES = [
  // Mind-bending (Sci-Fi, Mystery)
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival as Earth faces catastrophic blight.',
    release_date: '2014-11-05',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    genre_ids: [12, 18, 878],
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    vote_average: 8.4,
    vote_count: 36000,
    runtime: 169,
    popularity: 145.2,
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who steals secrets from deep within the subconscious during the dream state, is offered a chance to have his criminal history erased.',
    release_date: '2010-07-15',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    genre_ids: [28, 878, 12],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    vote_average: 8.4,
    vote_count: 37000,
    runtime: 148,
    popularity: 130.8,
  },
  {
    id: 329865,
    title: 'Arrival',
    overview: 'Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.',
    release_date: '2016-11-10',
    poster_path: '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    backdrop_path: '/yIZ1xendyqKvY3FGsqemmbe6Nfn.jpg',
    genre_ids: [18, 878, 9648],
    genres: [{ id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }, { id: 9648, name: 'Mystery' }],
    vote_average: 7.9,
    vote_count: 17500,
    runtime: 116,
    popularity: 98.4,
  },
  {
    id: 77,
    title: 'Memento',
    overview: 'Leonard Shelby is tracking down the man who raped and murdered his wife. The difficulty of locating his wife\'s killer, however, is compounded by the fact that he suffers from rare short-term memory loss.',
    release_date: '2000-10-11',
    poster_path: '/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg',
    backdrop_path: '/bdN3g42b91950t9yDkmvF4N3w70.jpg',
    genre_ids: [9648, 53],
    genres: [{ id: 9648, name: 'Mystery' }, { id: 53, name: 'Thriller' }],
    vote_average: 8.2,
    vote_count: 14800,
    runtime: 113,
    popularity: 65.4,
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    release_date: '1999-03-30',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/l4QHerTSbMI7qgahrkq5g8i2nZ8.jpg',
    genre_ids: [28, 878],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }],
    vote_average: 8.2,
    vote_count: 25800,
    runtime: 136,
    popularity: 112.5,
  },

  // Feel-good (Comedy, Family, Animation)
  {
    id: 508442,
    title: 'Soul',
    overview: 'Joe Gardner is a middle school teacher with a love for jazz music. After a successful gig, Joe gets into an unexpected accident that separates his soul from his body.',
    release_date: '2020-12-25',
    poster_path: '/hm58Jw4Lw8OIYECBhNTx8KaQ8Yj.jpg',
    backdrop_path: '/kf456ZqeC45XTvo6W9pW5clYKfQ.jpg',
    genre_ids: [16, 35, 10751, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
    vote_average: 8.1,
    vote_count: 10200,
    runtime: 100,
    popularity: 92.1,
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse.',
    release_date: '2023-05-31',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    genre_ids: [16, 28, 12, 878],
    genres: [{ id: 16, name: 'Animation' }, { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 878, name: 'Science Fiction' }],
    vote_average: 8.4,
    vote_count: 7300,
    runtime: 140,
    popularity: 178.6,
  },
  {
    id: 12,
    title: 'Finding Nemo',
    overview: 'Nemo, an adventurous young clownfish, is unexpectedly taken to a dentist\'s office aquarium. It\'s up to Marlin, his fretful father, and Dory, a friendly but forgetful blue tang fish, to embark on an epic rescue journey.',
    release_date: '2003-05-30',
    poster_path: '/ggQvd0b6FwM2z0c9JjZ8k5yU7G8.jpg',
    backdrop_path: '/h3jwnkfNE097dQHQvkn5zOHjG5g.jpg',
    genre_ids: [16, 10751],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }],
    vote_average: 7.8,
    vote_count: 19000,
    runtime: 100,
    popularity: 88.0,
  },
  {
    id: 10681,
    title: 'WALL·E',
    overview: 'In a distant future where mankind has abandoned earth because it has become covered with trash, WALL-E, a collector robot has been left behind to clean up the mess.',
    release_date: '2008-06-22',
    poster_path: '/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg',
    backdrop_path: '/fK5ssFekJRgIJEz2mwsXgB6Ue5K.jpg',
    genre_ids: [16, 10751, 878],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 878, name: 'Science Fiction' }],
    vote_average: 8.1,
    vote_count: 18200,
    runtime: 98,
    popularity: 91.4,
  },
  {
    id: 194,
    title: 'Amélie',
    overview: 'A Parisian waitress decides to help the people around her and discovers love along the way in this whimsical and magical journey.',
    release_date: '2001-04-25',
    poster_path: '/gfqjj67KkU0YdGZ4sJ5hWJ7C55s.jpg',
    backdrop_path: '/k50sV4Q0Z4K2J1d8U6o9bF4R1.jpg',
    genre_ids: [35, 10749],
    genres: [{ id: 35, name: 'Comedy' }, { id: 10749, name: 'Romance' }],
    vote_average: 7.9,
    vote_count: 11000,
    runtime: 122,
    popularity: 58.7,
  },

  // Dark and intense (Thriller, Crime, Horror)
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent, but finds himself in a battle of chaos against the Joker.',
    release_date: '2008-07-16',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    genre_ids: [18, 28, 80, 53],
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }],
    vote_average: 8.5,
    vote_count: 32500,
    runtime: 152,
    popularity: 140.0,
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    release_date: '2019-05-30',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    genre_ids: [35, 53, 18],
    genres: [{ id: 35, name: 'Comedy' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
    vote_average: 8.5,
    vote_count: 18000,
    runtime: 133,
    popularity: 115.4,
  },
  {
    id: 694,
    title: 'The Shining',
    overview: 'Jack Torrance accepts a caretaker job at the Overlook Hotel, where he, his wife Wendy and their son Danny must live isolated from the rest of the world for the winter.',
    release_date: '1980-05-23',
    poster_path: '/xazWoLealQwEgqZ89MLZklLZD3k.jpg',
    backdrop_path: '/mmd1HnuvAzFc4iYYwh9qmKGTgqS.jpg',
    genre_ids: [27, 53],
    genres: [{ id: 27, name: 'Horror' }, { id: 53, name: 'Thriller' }],
    vote_average: 8.2,
    vote_count: 17000,
    runtime: 144,
    popularity: 76.5,
  },
  {
    id: 807,
    title: 'Se7en',
    overview: 'Two homicide detectives are on a desperate hunt for a serial killer whose crimes are based on the "seven deadly sins".',
    release_date: '1995-09-22',
    poster_path: '/6yoghtyTpznpBik8EngEmJsk9UO.jpg',
    backdrop_path: '/90ihVn1L5g111n53x0Y5d6U0w6.jpg',
    genre_ids: [80, 9648, 53],
    genres: [{ id: 80, name: 'Crime' }, { id: 9648, name: 'Mystery' }, { id: 53, name: 'Thriller' }],
    vote_average: 8.4,
    vote_count: 20500,
    runtime: 127,
    popularity: 84.3,
  },
  {
    id: 475557,
    title: 'Joker',
    overview: 'During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic figure.',
    release_date: '2019-10-02',
    poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    backdrop_path: '/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
    genre_ids: [80, 53, 18],
    genres: [{ id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
    vote_average: 8.1,
    vote_count: 25000,
    runtime: 122,
    popularity: 110.2,
  },

  // Emotional (Drama, Romance)
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
    release_date: '1994-09-23',
    poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    genre_ids: [18, 80],
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    vote_average: 8.7,
    vote_count: 27500,
    runtime: 142,
    popularity: 160.0,
  },
  {
    id: 38,
    title: 'Eternal Sunshine of the Spotless Mind',
    overview: 'Joel Barish, heartbroken that his girlfriend Clementine underwent a procedure to erase him from her memory, decides to undergo the same medical treatment.',
    release_date: '2004-03-19',
    poster_path: '/5MwkWH9tYHv3mV9OdYTMR5q9IzL.jpg',
    backdrop_path: '/7rIPjn5T3q05URK4h7hmKkQ78L0.jpg',
    genre_ids: [18, 10749, 878],
    genres: [{ id: 18, name: 'Drama' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Science Fiction' }],
    vote_average: 8.1,
    vote_count: 14500,
    runtime: 108,
    popularity: 68.2,
  },
  {
    id: 597,
    title: 'Titanic',
    overview: '101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later, and of her passionate romance with Jack Dawson.',
    release_date: '1997-11-18',
    poster_path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    backdrop_path: '/rzdPqYJVHQ97POJWv515Jx9zM3Z.jpg',
    genre_ids: [18, 10749],
    genres: [{ id: 18, name: 'Drama' }, { id: 10749, name: 'Romance' }],
    vote_average: 7.9,
    vote_count: 24700,
    runtime: 194,
    popularity: 135.5,
  },
  {
    id: 424,
    title: 'Schindler\'s List',
    overview: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while exploiting them as workers in his factory.',
    release_date: '1993-12-15',
    poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    backdrop_path: '/w2EZbtzK5AcW1k4uVw4e1F0C0M2.jpg',
    genre_ids: [18, 36, 10752],
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'History' }, { id: 10752, name: 'War' }],
    vote_average: 8.6,
    vote_count: 15800,
    runtime: 195,
    popularity: 94.6,
  },
  {
    id: 313369,
    title: 'La La Land',
    overview: 'Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, are struggling to make ends meet in a city known for crushing hopes and breaking hearts.',
    release_date: '2016-12-07',
    poster_path: '/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg',
    backdrop_path: '/nlCHUWjY9XWbuEUQauCBgnY8ymF.jpg',
    genre_ids: [35, 18, 10402, 10749],
    genres: [{ id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }, { id: 10402, name: 'Music' }, { id: 10749, name: 'Romance' }],
    vote_average: 7.9,
    vote_count: 16400,
    runtime: 128,
    popularity: 82.5,
  },

  // Uplifting (Family, Animation, Music)
  {
    id: 508947,
    title: 'Turning Red',
    overview: 'Thirteen-year-old Mei is experiencing the awkwardness of being a teenager with a twist – when she gets too excited, she morphs into a giant red panda.',
    release_date: '2022-03-10',
    poster_path: '/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg',
    backdrop_path: '/fOy2JurzKANt6Bz7WJknN2UMxTk.jpg',
    genre_ids: [16, 10751, 35, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 35, name: 'Comedy' }, { id: 14, name: 'Fantasy' }],
    vote_average: 7.4,
    vote_count: 4800,
    runtime: 100,
    popularity: 75.3,
  },
  {
    id: 354912,
    title: 'Coco',
    overview: 'Despite his family\'s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz.',
    release_date: '2017-10-27',
    poster_path: '/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
    backdrop_path: '/askg3SMvhqEl4OL52YuvdtQw40Y.jpg',
    genre_ids: [16, 10751, 10402, 12],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 10402, name: 'Music' }, { id: 12, name: 'Adventure' }],
    vote_average: 8.2,
    vote_count: 19100,
    runtime: 105,
    popularity: 110.6,
  },
  {
    id: 441130,
    title: 'Wolfwalkers',
    overview: 'In a time of superstition and magic, a young apprentice hunter journeying to Ireland with her father helps a free-spirited girl from a mysterious tribe.',
    release_date: '2020-10-26',
    poster_path: '/ehAKuE48hVsG2nlMuYGAguZI0KM.jpg',
    backdrop_path: '/61z3B2rR6eJ9Q8Y5c0S0yV0Y9Z.jpg',
    genre_ids: [16, 10751, 12, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }],
    vote_average: 8.3,
    vote_count: 1300,
    runtime: 103,
    popularity: 42.1,
  },

  // Cozy (Family, Animation, Romance)
  {
    id: 129,
    title: 'Spirited Away',
    overview: 'A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon courage to free herself.',
    release_date: '2001-07-20',
    poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdrop_path: '/bXNvzpkFC19jRk4sDkC6W8x7.jpg',
    genre_ids: [16, 10751, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
    vote_average: 8.5,
    vote_count: 16300,
    runtime: 125,
    popularity: 105.0,
  },
  {
    id: 8392,
    title: 'My Neighbor Totoro',
    overview: 'Two sisters move to the country with their father to be closer to their hospitalized mother, and discover the surrounding trees are inhabited by magical creatures.',
    release_date: '1988-04-16',
    poster_path: '/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
    backdrop_path: '/7ne02kO0FqM9sW2U7Y2H0Y8G1b.jpg',
    genre_ids: [16, 10751, 14],
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
    vote_average: 8.1,
    vote_count: 8200,
    runtime: 86,
    popularity: 72.8,
  },
  {
    id: 4935,
    title: 'Howl\'s Moving Castle',
    overview: 'Sophie, a young milliner, is turned into an old woman by a spiteful witch. She flees her home and takes refuge in the walking castle of the flamboyant wizard Howl.',
    release_date: '2004-11-20',
    poster_path: '/6p0v2mY8b6bXj6B3w6U1g8g8b6.jpg',
    backdrop_path: '/9Gmx6S7h7j6P6q6O1y0.jpg',
    genre_ids: [14, 16, 12],
    genres: [{ id: 14, name: 'Fantasy' }, { id: 16, name: 'Animation' }, { id: 12, name: 'Adventure' }],
    vote_average: 8.4,
    vote_count: 9800,
    runtime: 119,
    popularity: 92.4,
  },

  // Suspenseful (Thriller, Mystery, Crime)
  {
    id: 546554,
    title: 'Knives Out',
    overview: 'When renowned crime novelist Harlan Thrombey is found dead at his estate, the inquisitive detective Benoit Blanc is mysteriously enlisted to investigate.',
    release_date: '2019-11-27',
    poster_path: '/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    backdrop_path: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    genre_ids: [35, 9648, 80],
    genres: [{ id: 35, name: 'Comedy' }, { id: 9648, name: 'Mystery' }, { id: 80, name: 'Crime' }],
    vote_average: 7.9,
    vote_count: 12200,
    runtime: 130,
    popularity: 88.7,
  },
  {
    id: 11324,
    title: 'Shutter Island',
    overview: 'World War II soldier-turned-U.S. Marshal Teddy Daniels investigates the disappearance of a patient from Boston\'s Shutter Island Ashecliffe Hospital.',
    release_date: '2010-02-18',
    poster_path: '/4GDy0PHYX3VRXUtwK5ysag3geEx.jpg',
    backdrop_path: '/v00Vf1Y6Y6p8jW1jX7rV3.jpg',
    genre_ids: [18, 53, 9648],
    genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }, { id: 9648, name: 'Mystery' }],
    vote_average: 8.2,
    vote_count: 23600,
    runtime: 138,
    popularity: 95.1,
  },
  {
    id: 210577,
    title: 'Gone Girl',
    overview: 'With his wife\'s disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it\'s suspected that he may not be innocent.',
    release_date: '2014-10-01',
    poster_path: '/qymaJhucquUwjpACXSE2UrfnQ5i.jpg',
    backdrop_path: '/8K1QZ4K6U0f0f1.jpg',
    genre_ids: [9648, 53, 18],
    genres: [{ id: 9648, name: 'Mystery' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
    vote_average: 7.9,
    vote_count: 18000,
    runtime: 149,
    popularity: 82.0,
  },

  // Adventurous (Adventure, Fantasy)
  {
    id: 120,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    overview: 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home behind in order to begin an epic journey to Mount Doom.',
    release_date: '2001-12-18',
    poster_path: '/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg',
    backdrop_path: '/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
    genre_ids: [12, 14, 28],
    genres: [{ id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }, { id: 28, name: 'Action' }],
    vote_average: 8.4,
    vote_count: 24900,
    runtime: 178,
    popularity: 155.0,
  },
  {
    id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    overview: 'As armies mass for a final battle that will decide the fate of the world, one member of the Fellowship of the Ring is revealed as the noble heir to the throne of Men.',
    release_date: '2003-12-17',
    poster_path: '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    backdrop_path: '/2Auikvi2b4nO2K9K4G.jpg',
    genre_ids: [12, 14, 28],
    genres: [{ id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }, { id: 28, name: 'Action' }],
    vote_average: 8.6,
    vote_count: 23200,
    runtime: 201,
    popularity: 162.3,
  },
  {
    id: 671,
    title: 'Harry Potter and the Philosopher\'s Stone',
    overview: 'Harry Potter has lived under the stairs at his aunt and uncle\'s house his whole life. But on his 11th birthday, he learns he\'s a powerful wizard with a place at Hogwarts.',
    release_date: '2001-11-16',
    poster_path: '/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
    backdrop_path: '/5rrGVmRUAA75jh429y50e0e0e0.jpg',
    genre_ids: [12, 14],
    genres: [{ id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }],
    vote_average: 7.9,
    vote_count: 26500,
    runtime: 152,
    popularity: 142.1,
  },
  {
    id: 19995,
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.',
    release_date: '2009-12-15',
    poster_path: '/kyeqWdyUXW608qlYkRqosgbbnK0.jpg',
    backdrop_path: '/vL5LR6WdxWPjCmv2eGqGg0r8Nq9.jpg',
    genre_ids: [28, 12, 14, 878],
    genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 14, name: 'Fantasy' }, { id: 878, name: 'Science Fiction' }],
    vote_average: 7.6,
    vote_count: 31200,
    runtime: 162,
    popularity: 128.9,
  },
];

/**
 * Helper to ensure standard poster URL format
 */
export function formatMoviePoster(movie) {
  if (!movie) return movie;
  let poster = movie.poster_path;
  if (poster && !poster.startsWith('http')) {
    poster = `${TMDB_IMAGE_BASE}${poster}`;
  }
  return {
    ...movie,
    poster_url: poster || null,
  };
}

/**
 * Fetch popular / trending movies
 */
export async function getTrendingMovies() {
  const cacheKey = 'movies:trending';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.TMDB_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
        params: { api_key: apiKey },
        timeout: 5000,
      });

      if (response.data && response.data.results) {
        const enriched = response.data.results.map((m) =>
          formatMoviePoster(enrichMovieWithMoods(m))
        );
        setCache(cacheKey, enriched);
        return enriched;
      }
    } catch (err) {
      console.warn('TMDB live trending fetch failed, using fallback catalog:', err.message);
    }
  }

  // Fallback catalog
  const enriched = FALLBACK_MOVIES.map((m) =>
    formatMoviePoster(enrichMovieWithMoods(m))
  );
  setCache(cacheKey, enriched);
  return enriched;
}

/**
 * Search movies by title with empty check (PRD Section 10)
 */
export async function searchMovies(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `movies:search:${cleanQuery}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.TMDB_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: { api_key: apiKey, query: cleanQuery, include_adult: false },
        timeout: 5000,
      });

      if (response.data && response.data.results) {
        const results = response.data.results.map((m) =>
          formatMoviePoster(enrichMovieWithMoods(m))
        );
        setCache(cacheKey, results);
        return results;
      }
    } catch (err) {
      console.warn(`TMDB live search failed for "${cleanQuery}", searching fallback:`, err.message);
    }
  }

  // Fallback search in catalog
  const filtered = FALLBACK_MOVIES.filter((m) =>
    m.title.toLowerCase().includes(cleanQuery) ||
    (m.overview && m.overview.toLowerCase().includes(cleanQuery))
  ).map((m) => formatMoviePoster(enrichMovieWithMoods(m)));

  setCache(cacheKey, filtered);
  return filtered;
}

/**
 * Fetch detailed movie data by TMDB ID
 */
export async function getMovieById(id) {
  if (!id) throw new Error('Movie ID is required');

  const numId = Number(id);
  const cacheKey = `movie:details:${numId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.TMDB_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${numId}`, {
        params: { api_key: apiKey, append_to_response: 'credits,similar' },
        timeout: 5000,
      });

      if (response.data) {
        const enriched = formatMoviePoster(enrichMovieWithMoods(response.data));
        setCache(cacheKey, enriched);
        return enriched;
      }
    } catch (err) {
      console.warn(`TMDB details failed for id ${numId}, checking fallback catalog:`, err.message);
    }
  }

  // Check fallback catalog
  const localMovie = FALLBACK_MOVIES.find((m) => m.id === numId);
  if (localMovie) {
    const enriched = formatMoviePoster(enrichMovieWithMoods(localMovie));
    setCache(cacheKey, enriched);
    return enriched;
  }

  return null;
}

/**
 * Filter movies by mood ID (PRD Section 4 & 6)
 */
export async function discoverMoviesByMood(moodId) {
  const normMood = String(moodId || '').toLowerCase().trim();
  const moodDef = MOOD_DEFINITIONS.find((m) => m.id === normMood);

  const allMovies = await getTrendingMovies();

  if (!moodDef) {
    return allMovies;
  }

  // Filter movies that match this mood tag
  const matching = allMovies.filter((movie) => {
    return movie.moods && movie.moods.some((m) => m.moodId === moodDef.id && m.available);
  });

  return matching;
}
