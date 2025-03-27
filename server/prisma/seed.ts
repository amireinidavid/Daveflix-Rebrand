import { PrismaClient, UserRole, ContentType, MaturityRating, TrailerType, VideoSourceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // // Hash the admin password
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash("daveflix123", salt);

  // // Create admin user
  // const admin = await prisma.user.upsert({
  //   where: { email: "admin@daveflix.com" },
  //   update: {},
  //   create: {
  //     email: "admin@daveflix.com",
  //     password: hashedPassword,
  //     firstName: "Admin",
  //     lastName: "User",
  //     role: UserRole.ADMIN,
  //     isVerified: true,
  //     // Create a default profile for admin
  //     profiles: {
  //       create: {
  //         name: "Admin Profile",
  //         maturityLevel: 18,
  //         language: "en",
  //       },
  //     },
  //     // Set some default preferences
  //     preferredLanguage: "en",
  //     maxStreamingQuality: "UHD_4K",
  //     simultaneousStreams: 4,
  //     downloadEnabled: true,
  //     // Create notification preferences
  //     notificationPreferences: {
  //       create: {
  //         emailNotifications: true,
  //         pushNotifications: true,
  //         newContent: true,
  //         newsletters: true,
  //       },
  //     },
  //   },
  // });

  // console.log({ admin });


  // Create genres first
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { name: "Action" },
      update: {},
      create: {
        name: "Action",
        description: "Action-packed movies with thrilling sequences",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Adventure" },
      update: {},
      create: {
        name: "Adventure",
        description: "Movies featuring exciting journeys and quests",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Comedy" },
      update: {},
      create: {
        name: "Comedy",
        description: "Funny and humorous content",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Drama" },
      update: {},
      create: {
        name: "Drama",
        description: "Character-driven stories with emotional themes",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Sci-Fi" },
      update: {},
      create: {
        name: "Sci-Fi",
        description: "Science fiction content with futuristic concepts",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Thriller" },
      update: {},
      create: {
        name: "Thriller",
        description: "Suspenseful and exciting content",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Horror" },
      update: {},
      create: {
        name: "Horror",
        description: "Scary and frightening content",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Fantasy" },
      update: {},
      create: {
        name: "Fantasy",
        description: "Content featuring magical and supernatural elements",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Crime" },
      update: {},
      create: {
        name: "Crime",
        description: "Content involving criminal activities and investigations",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Documentary" },
      update: {},
      create: {
        name: "Documentary",
        description: "Factual content about real events and people",
      },
    }),
  ]);

  console.log("Created genres:", genres.map(g => g.name));

  // Create content
  // 1. Inception (Movie)
   const inception = await prisma.content.create({
    data: {
      title: "Inception",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      type: ContentType.MOVIE,
      releaseYear: 2010,
      maturityRating: MaturityRating.PG_13,
      duration: 148,
      posterImage: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/inception.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/inception-sd.mp4",
      videoHD: "https://example.com/movies/inception-hd.mp4",
      video4K: "https://example.com/movies/inception-4k.mp4",
      featured: true,
      trending: true,
      newRelease: false,
      director: "Christopher Nolan",
      studio: "Warner Bros. Pictures",
      language: "en",
      country: "United States",
      awards: "Academy Award for Best Cinematography, Best Sound Editing, Best Sound Mixing, Best Visual Effects",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: false,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de", "it"],
      viewCount: 1250000,
      averageRating: 4.8,
      likeCount: 980000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Action")!.id },
          { genreId: genres.find(g => g.name === "Sci-Fi")!.id },
          { genreId: genres.find(g => g.name === "Thriller")!.id }
        ]
      }
    }
  });

  // 2. The Shawshank Redemption (Movie)
  const shawshank = await prisma.content.create({
    data: {
      title: "The Shawshank Redemption",
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      type: ContentType.MOVIE,
      releaseYear: 1994,
      maturityRating: MaturityRating.R,
      duration: 142,
      posterImage: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/shawshank-redemption.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/shawshank-redemption-sd.mp4",
      videoHD: "https://example.com/movies/shawshank-redemption-hd.mp4",
      featured: true,
      trending: true,
      newRelease: false,
      director: "Frank Darabont",
      studio: "Castle Rock Entertainment",
      language: "en",
      country: "United States",
      awards: "7 Academy Award nominations",
      hasSD: true,
      hasHD: true,
      has4K: false,
      hasHDR: false,
      audioLanguages: ["en", "es"],
      subtitleLanguages: ["en", "es", "fr"],
      viewCount: 980000,
      averageRating: 4.9,
      likeCount: 850000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id }
        ]
      }
    }
  });

  // 3. The Dark Knight (Movie)
  const darkKnight = await prisma.content.create({
    data: {
      title: "The Dark Knight",
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      type: ContentType.MOVIE,
      releaseYear: 2008,
      maturityRating: MaturityRating.PG_13,
      duration: 152,
      posterImage: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/dark-knight.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/dark-knight-sd.mp4",
      videoHD: "https://example.com/movies/dark-knight-hd.mp4",
      video4K: "https://example.com/movies/dark-knight-4k.mp4",
      featured: false,
      trending: true,
      newRelease: false,
      director: "Christopher Nolan",
      studio: "Warner Bros. Pictures",
      language: "en",
      country: "United States",
      awards: "Academy Award for Best Supporting Actor (Heath Ledger)",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de", "it"],
      viewCount: 870000,
      averageRating: 4.7,
      likeCount: 780000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Action")!.id },
          { genreId: genres.find(g => g.name === "Crime")!.id },
          { genreId: genres.find(g => g.name === "Drama")!.id }
        ]
      }
    }
  });

  // 4. Pulp Fiction (Movie)
  const pulpFiction = await prisma.content.create({
    data: {
      title: "Pulp Fiction",
      description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      type: ContentType.MOVIE,
      releaseYear: 1994,
      maturityRating: MaturityRating.R,
      duration: 154,
      posterImage: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/pulp-fiction.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/pulp-fiction-sd.mp4",
      videoHD: "https://example.com/movies/pulp-fiction-hd.mp4",
      featured: false,
      trending: false,
      newRelease: false,
      director: "Quentin Tarantino",
      studio: "Miramax Films",
      language: "en",
      country: "United States",
      awards: "Academy Award for Best Original Screenplay",
      hasSD: true,
      hasHD: true,
      has4K: false,
      hasHDR: false,
      audioLanguages: ["en", "es"],
      subtitleLanguages: ["en", "es", "fr", "de"],
      viewCount: 760000,
      averageRating: 4.6,
      likeCount: 720000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Crime")!.id },
          { genreId: genres.find(g => g.name === "Drama")!.id }
        ]
      }
    }
  });

  // 5. The Matrix (Movie)
  const matrix = await prisma.content.create({
    data: {
      title: "The Matrix",
      description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      type: ContentType.MOVIE,
      releaseYear: 1999,
      maturityRating: MaturityRating.R,
      duration: 136,
      posterImage: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/matrix.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/matrix-sd.mp4",
      videoHD: "https://example.com/movies/matrix-hd.mp4",
      video4K: "https://example.com/movies/matrix-4k.mp4",
      videoHDR: "https://example.com/movies/matrix-hdr.mp4",
      featured: true,
      trending: false,
      newRelease: false,
      director: "Lana and Lilly Wachowski",
      studio: "Warner Bros. Pictures",
      language: "en",
      country: "United States",
      awards: "4 Academy Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja"],
      viewCount: 720000,
      averageRating: 4.5,
      likeCount: 680000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Action")!.id },
          { genreId: genres.find(g => g.name === "Sci-Fi")!.id }
        ]
      }
    }
  });

  // 6. Interstellar (Movie)
  const interstellar = await prisma.content.create({
    data: {
      title: "Interstellar",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      type: ContentType.MOVIE,
      releaseYear: 2014,
      maturityRating: MaturityRating.PG_13,
      duration: 169,
      posterImage: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/interstellar.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/interstellar-sd.mp4",
      videoHD: "https://example.com/movies/interstellar-hd.mp4",
      video4K: "https://example.com/movies/interstellar-4k.mp4",
      videoHDR: "https://example.com/movies/interstellar-hdr.mp4",
      featured: true,
      trending: true,
      newRelease: false,
      director: "Christopher Nolan",
      studio: "Paramount Pictures",
      language: "en",
      country: "United States",
      awards: "Academy Award for Best Visual Effects",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "ko"],
      viewCount: 620000,
      averageRating: 4.7,
      likeCount: 580000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Adventure")!.id },
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Sci-Fi")!.id }
        ]
      }
    }
  });

  // 7. The Godfather (Movie)
  const godfather = await prisma.content.create({
    data: {
      title: "The Godfather",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      type: ContentType.MOVIE,
      releaseYear: 1972,
      maturityRating: MaturityRating.R,
      duration: 175,
      posterImage: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/godfather.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/godfather-sd.mp4",
      videoHD: "https://example.com/movies/godfather-hd.mp4",
      video4K: "https://example.com/movies/godfather-4k.mp4",
      featured: true,
      trending: false,
      newRelease: false,
      director: "Francis Ford Coppola",
      studio: "Paramount Pictures",
      language: "en",
      country: "United States",
      awards: "3 Academy Awards including Best Picture",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: false,
      audioLanguages: ["en", "es", "it"],
      subtitleLanguages: ["en", "es", "fr", "de", "it"],
      viewCount: 590000,
      averageRating: 4.9,
      likeCount: 550000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Crime")!.id },
          { genreId: genres.find(g => g.name === "Drama")!.id }
        ]
      }
    }
  });

  // 8. Fight Club (Movie)
  const fightClub = await prisma.content.create({
    data: {
      title: "Fight Club",
      description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
      type: ContentType.MOVIE,
      releaseYear: 1999,
      maturityRating: MaturityRating.R,
      duration: 139,
      posterImage: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/fight-club.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/fight-club-sd.mp4",
      videoHD: "https://example.com/movies/fight-club-hd.mp4",
      featured: false,
      trending: false,
      newRelease: false,
      director: "David Fincher",
      studio: "20th Century Fox",
      language: "en",
      country: "United States",
      awards: "Nominated for Academy Award for Best Sound Effects Editing",
      hasSD: true,
      hasHD: true,
      has4K: false,
      hasHDR: false,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de"],
      viewCount: 560000,
      averageRating: 4.5,
      likeCount: 520000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Thriller")!.id }
        ]
      }
    }
  });

  // 9. Forrest Gump (Movie)
  const forrestGump = await prisma.content.create({
    data: {
      title: "Forrest Gump",
      description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75.",
      type: ContentType.MOVIE,
      releaseYear: 1994,
      maturityRating: MaturityRating.PG_13,
      duration: 142,
      posterImage: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=bLvqoHBptjg",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/forrest-gump.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/forrest-gump-sd.mp4",
      videoHD: "https://example.com/movies/forrest-gump-hd.mp4",
      featured: true,
      trending: false,
      newRelease: false,
      director: "Robert Zemeckis",
      studio: "Paramount Pictures",
      language: "en",
      country: "United States",
      awards: "6 Academy Awards including Best Picture",
      hasSD: true,
      hasHD: true,
      has4K: false,
      hasHDR: false,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de", "it"],
      viewCount: 530000,
      averageRating: 4.8,
      likeCount: 500000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Comedy")!.id }
        ]
      }
    }
  });

  // 10. The Lord of the Rings: The Fellowship of the Ring (Movie)
  const lotr = await prisma.content.create({
    data: {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
      type: ContentType.MOVIE,
      releaseYear: 2001,
      maturityRating: MaturityRating.PG_13,
      duration: 178,
      posterImage: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=V75dMMIW2B4",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/lotr-fellowship.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/lotr-fellowship-sd.mp4",
      videoHD: "https://example.com/movies/lotr-fellowship-hd.mp4",
      video4K: "https://example.com/movies/lotr-fellowship-4k.mp4",
      videoHDR: "https://example.com/movies/lotr-fellowship-hdr.mp4",
      featured: true,
      trending: false,
      newRelease: false,
      director: "Peter Jackson",
      studio: "New Line Cinema",
      language: "en",
      country: "New Zealand",
      awards: "4 Academy Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh"],
      viewCount: 500000,
      averageRating: 4.8,
      likeCount: 470000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Adventure")!.id },
          { genreId: genres.find(g => g.name === "Fantasy")!.id }
        ]
      }
    }
  });

  // 11. The Silence of the Lambs (Movie)
  const silenceOfTheLambs = await prisma.content.create({
    data: {
      title: "The Silence of the Lambs",
      description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
      type: ContentType.MOVIE,
      releaseYear: 1991,
      maturityRating: MaturityRating.R,
      duration: 118,
      posterImage: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=W6Mm8Sbe__o",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/silence-of-the-lambs.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/silence-of-the-lambs-sd.mp4",
      videoHD: "https://example.com/movies/silence-of-the-lambs-hd.mp4",
      featured: false,
      trending: false,
      newRelease: false,
      director: "Jonathan Demme",
      studio: "Orion Pictures",
      language: "en",
      country: "United States",
      awards: "5 Academy Awards including Best Picture",
      hasSD: true,
      hasHD: true,
      has4K: false,
      hasHDR: false,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de"],
      viewCount: 480000,
      averageRating: 4.6,
      likeCount: 450000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Thriller")!.id },
          { genreId: genres.find(g => g.name === "Crime")!.id }
        ]
      }
    }
  });

  // 12. Parasite (Movie)
  const parasite = await prisma.content.create({
    data: {
      title: "Parasite",
      description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
      type: ContentType.MOVIE,
      releaseYear: 2019,
      maturityRating: MaturityRating.R,
      duration: 132,
      posterImage: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/parasite.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/parasite-sd.mp4",
      videoHD: "https://example.com/movies/parasite-hd.mp4",
      video4K: "https://example.com/movies/parasite-4k.mp4",
      featured: true,
      trending: true,
      newRelease: false,
      director: "Bong Joon-ho",
      studio: "CJ Entertainment",
      language: "ko",
      country: "South Korea",
      awards: "4 Academy Awards including Best Picture",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: false,
      audioLanguages: ["ko", "en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh"],
      viewCount: 420000,
      averageRating: 4.7,
      likeCount: 400000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Thriller")!.id }
        ]
      }
    }
  });

  // 13. Joker (Movie)
  const joker = await prisma.content.create({
    data: {
      title: "Joker",
      description: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.",
      type: ContentType.MOVIE,
      releaseYear: 2019,
      maturityRating: MaturityRating.R,
      duration: 122,
      posterImage: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=zAGVQLHvwOY",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/joker.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/joker-sd.mp4",
      videoHD: "https://example.com/movies/joker-hd.mp4",
      video4K: "https://example.com/movies/joker-4k.mp4",
      featured: true,
      trending: true,
      newRelease: false,
      director: "Todd Phillips",
      studio: "Warner Bros. Pictures",
      language: "en",
      country: "United States",
      awards: "2 Academy Awards including Best Actor",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: false,
      audioLanguages: ["en", "es", "fr", "de"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja"],
      viewCount: 390000,
      averageRating: 4.5,
      likeCount: 370000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Crime")!.id },
          { genreId: genres.find(g => g.name === "Thriller")!.id }
        ]
      }
    }
  });

  // 14. Avengers: Endgame (Movie)
  const avengersEndgame = await prisma.content.create({
    data: {
      title: "Avengers: Endgame",
      description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
      type: ContentType.MOVIE,
      releaseYear: 2019,
      maturityRating: MaturityRating.PG_13,
      duration: 181,
      posterImage: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/avengers-endgame.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/avengers-endgame-sd.mp4",
      videoHD: "https://example.com/movies/avengers-endgame-hd.mp4",
      video4K: "https://example.com/movies/avengers-endgame-4k.mp4",
      videoHDR: "https://example.com/movies/avengers-endgame-hdr.mp4",
      featured: true,
      trending: true,
      newRelease: false,
      director: "Anthony Russo, Joe Russo",
      studio: "Marvel Studios",
      language: "en",
      country: "United States",
      awards: "Academy Award nomination for Best Visual Effects",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de", "it", "ja"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh", "ko", "pt", "ru"],
      viewCount: 1500000,
      averageRating: 4.7,
      likeCount: 1300000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Action")!.id },
          { genreId: genres.find(g => g.name === "Adventure")!.id },
          { genreId: genres.find(g => g.name === "Sci-Fi")!.id }
        ]
      }
    }
  });

  // 15. Get Out (Movie)
  const getOut = await prisma.content.create({
    data: {
      title: "Get Out",
      description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
      type: ContentType.MOVIE,
      releaseYear: 2017,
      maturityRating: MaturityRating.R,
      duration: 104,
      posterImage: "https://image.tmdb.org/t/p/w500/qbaIHiZaUQkYgr3cImquPjJXRJR.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/tFI8VLMgSTTU38i8TIsklfqS9Nl.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=DzfpyUB60YY",
      trailerType: TrailerType.URL,
      videoUrl: "https://example.com/movies/get-out.mp4",
      videoSourceType: VideoSourceType.URL,
      videoSD: "https://example.com/movies/get-out-sd.mp4",
      videoHD: "https://example.com/movies/get-out-hd.mp4",
      featured: false,
      trending: false,
      newRelease: false,
      director: "Jordan Peele",
      studio: "Universal Pictures",
      language: "en",
      country: "United States",
      awards: "Academy Award for Best Original Screenplay",
      hasSD: true,
      hasHD: true,
      has4K: false,
      hasHDR: false,
      audioLanguages: ["en", "es", "fr"],
      subtitleLanguages: ["en", "es", "fr", "de"],
      viewCount: 350000,
      averageRating: 4.5,
      likeCount: 330000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Horror")!.id },
          { genreId: genres.find(g => g.name === "Thriller")!.id }
        ]
      }
    }
  });

  // 16. Stranger Things (TV Show)
  const strangerThings = await prisma.content.create({
    data: {
      title: "Stranger Things",
      description: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
      type: ContentType.TV_SHOW,
      releaseYear: 2016,
      maturityRating: MaturityRating.TV_14,
      posterImage: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
      trailerType: TrailerType.URL,
      featured: true,
      trending: true,
      newRelease: false,
      studio: "Netflix",
      language: "en",
      country: "United States",
      awards: "Multiple Emmy Awards and Screen Actors Guild Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh"],
      viewCount: 2000000,
      averageRating: 4.8,
      likeCount: 1800000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Fantasy")!.id },
          { genreId: genres.find(g => g.name === "Horror")!.id }
        ]
      }
    }
  });

  // Create seasons and episodes for Stranger Things
  const strangerThingsSeason1 = await prisma.season.create({
    data: {
      showId: strangerThings.id,
      seasonNumber: 1,
      title: "Season 1",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
      posterImage: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      releaseYear: 2016,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: strangerThingsSeason1.id,
        episodeNumber: 1,
        title: "Chapter One: The Vanishing of Will Byers",
        description: "On his way home from a friend's house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.",
        duration: 49,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/AdwF73oCmm5qMpIcRf75wXCJLJi.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s01e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s01e01-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s01e01-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s01e01-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason1.id,
        episodeNumber: 2,
        title: "Chapter Two: The Weirdo on Maple Street",
        description: "Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.",
        duration: 49,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/8iA56ugQyHZmX81wSsNqwXjCE6F.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s01e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s01e02-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s01e02-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s01e02-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason1.id,
        episodeNumber: 3,
        title: "Chapter Three: Holly, Jolly",
        description: "An increasingly concerned Nancy looks for Barb and finds out what Jonathan's been up to. Joyce is convinced Will is trying to talk to her.",
        duration: 52,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/5snbTR3vHuPkC0FQJpXJYm3Dpbk.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s01e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s01e03-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s01e03-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s01e03-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason1.id,
        episodeNumber: 4,
        title: "Chapter Four: The Body",
        description: "Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover. Nancy and Jonathan form an unlikely alliance.",
        duration: 51,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/yzfxLMGsKsXWUvBP0HetRnhyPxW.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s01e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s01e04-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s01e04-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s01e04-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason1.id,
        episodeNumber: 5,
        title: "Chapter Five: The Flea and the Acrobat",
        description: "Hopper breaks into the lab while Nancy and Jonathan confront the force that took Will. The boys ask Mr. Clarke how to travel to another dimension.",
        duration: 53,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/exT4NW9EdXG1qLZHKJnRpq3gh1H.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s01e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s01e05-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s01e05-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s01e05-4k.mp4",
      },
    ]
  });

  const strangerThingsSeason2 = await prisma.season.create({
    data: {
      showId: strangerThings.id,
      seasonNumber: 2,
      title: "Season 2",
      overview: "It's been nearly a year since Will's strange disappearance. But life's hardly back to normal in Hawkins. Not even close.",
      posterImage: "https://image.tmdb.org/t/p/w500/lXS60geme1LlEob5Wgvj3KilClA.jpg",
      releaseYear: 2017,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: strangerThingsSeason2.id,
        episodeNumber: 1,
        title: "Chapter One: MADMAX",
        description: "As the town preps for Halloween, a high-scoring rival shakes things up at the arcade, and a skeptical Hopper inspects a field of rotting pumpkins.",
        duration: 48,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/9QuUE9bmSIhkKf9CYGPnhqW7337.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s02e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s02e01-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s02e01-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s02e01-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason2.id,
        episodeNumber: 2,
        title: "Chapter Two: Trick or Treat, Freak",
        description: "After Will sees something terrible on trick-or-treat night, Mike wonders whether Eleven's still out there. Nancy wrestles with the truth about Barb.",
        duration: 56,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/2rY9AMACQsxqO9ZUKk5jQZMPwXB.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s02e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s02e02-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s02e02-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s02e02-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason2.id,
        episodeNumber: 3,
        title: "Chapter Three: The Pollywog",
        description: "Dustin adopts a strange new pet, and Eleven grows increasingly impatient. A well-meaning Bob urges Will to stand up to his fears.",
        duration: 51,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/4vKPPi5jHnJnXjDKYzGXkuBMGcw.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s02e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s02e03-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s02e03-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s02e03-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason2.id,
        episodeNumber: 4,
        title: "Chapter Four: Will the Wise",
        description: "An ailing Will opens up to Joyce -- with disturbing results. While Hopper digs for the truth, Eleven unearths a surprising discovery.",
        duration: 46,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/8DgYEGfMULI1RcCQXwJ8WdFP8o5.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s02e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s02e04-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s02e04-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s02e04-4k.mp4",
      },
      {
        seasonId: strangerThingsSeason2.id,
        episodeNumber: 5,
        title: "Chapter Five: Dig Dug",
        description: "Nancy and Jonathan swap conspiracy theories with a new ally as Eleven searches for someone from her past. 'Bob the Brain' tackles a difficult problem.",
        duration: 58,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/5EjGkqHMmbk1o8JiGmSyZzp5qQB.jpg",
        videoUrl: "https://example.com/shows/stranger-things/s02e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/stranger-things/s02e05-sd.mp4",
        videoHD: "https://example.com/shows/stranger-things/s02e05-hd.mp4",
        video4K: "https://example.com/shows/stranger-things/s02e05-4k.mp4",
      },
    ]
  });

  // 17. Breaking Bad (TV Show)
  const breakingBad = await prisma.content.create({
    data: {
      title: "Breaking Bad",
      description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
      type: ContentType.TV_SHOW,
      releaseYear: 2008,
      maturityRating: MaturityRating.TV_MA,
      posterImage: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY",
      trailerType: TrailerType.URL,
      featured: true,
      trending: true,
      newRelease: false,
      studio: "AMC",
      language: "en",
      country: "United States",
      awards: "16 Primetime Emmy Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh"],
      viewCount: 1800000,
      averageRating: 4.9,
      likeCount: 1700000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Crime")!.id },
          { genreId: genres.find(g => g.name === "Thriller")!.id }
        ]
      }
    }
  });

  // Create seasons and episodes for Breaking Bad
  const breakingBadSeason1 = await prisma.season.create({
    data: {
      showId: breakingBad.id,
      seasonNumber: 1,
      title: "Season 1",
      overview: "High school chemistry teacher Walter White's life is suddenly transformed by a dire medical diagnosis. Street-savvy former student Jesse Pinkman 'teaches' Walter a new trade.",
      posterImage: "https://image.tmdb.org/t/p/w500/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg",
      releaseYear: 2008,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: breakingBadSeason1.id,
        episodeNumber: 1,
        title: "Pilot",
        description: "Diagnosed with terminal lung cancer, chemistry teacher Walter White teams up with former student Jesse Pinkman to cook and sell crystal meth.",
        duration: 58,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s01e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s01e01-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s01e01-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s01e01-4k.mp4",
      },
      {
        seasonId: breakingBadSeason1.id,
        episodeNumber: 2,
        title: "Cat's in the Bag...",
        description: "After their first drug deal goes terribly wrong, Walt and Jesse must dispose of a corpse and find a way to keep cooking.",
        duration: 48,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/tjDNvbokPLtEnpFyFPyXMOd6Zr1.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s01e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s01e02-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s01e02-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s01e02-4k.mp4",
      },
      {
        seasonId: breakingBadSeason1.id,
        episodeNumber: 3,
        title: "...And the Bag's in the River",
        description: "Walt and Jesse clean up after the bathtub incident before Walt returns to teaching. Walt's wife Skyler grows suspicious about his activities.",
        duration: 48,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/2kBeBlxGqBOdWlKwzAxiwkfU5on.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s01e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s01e03-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s01e03-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s01e03-4k.mp4",
      },
      {
        seasonId: breakingBadSeason1.id,
        episodeNumber: 4,
        title: "Cancer Man",
        description: "Walt tells the rest of his family about his cancer. Jesse's parents throw him out of his own house.",
        duration: 48,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/i5BAJVhuIWfkoSqDID6FnQNCTVc.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s01e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s01e04-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s01e04-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s01e04-4k.mp4",
      },
      {
        seasonId: breakingBadSeason1.id,
        episodeNumber: 5,
        title: "Gray Matter",
        description: "Walt rejects treatment and tries to return to normal life. Jesse tries to go straight.",
        duration: 48,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/3xnWaLQcFpGGGQpKLyKgFEk5rMN.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s01e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s01e05-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s01e05-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s01e05-4k.mp4",
      },
    ]
  });

  const breakingBadSeason2 = await prisma.season.create({
    data: {
      showId: breakingBad.id,
      seasonNumber: 2,
      title: "Season 2",
      overview: "Walt and Jesse face the deadly consequences of their actions. Skyler grows suspicious of Walt's activities, while Jesse finds himself in a professional and personal downward spiral.",
      posterImage: "https://image.tmdb.org/t/p/w500/ww8JxwKAkCRc7QpYwcYRQPtHGJD.jpg",
      releaseYear: 2009,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: breakingBadSeason2.id,
        episodeNumber: 1,
        title: "Seven Thirty-Seven",
        description: "Walt and Jesse face the deadly consequences of their actions. Skyler grows suspicious of Walt's activities, while Jesse finds himself in a professional and personal downward spiral.",
        duration: 47,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/hyYwqbmcHn3fuxiCEJbT6YxhAkb.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s02e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s02e01-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s02e01-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s02e01-4k.mp4",
      },
      {
        seasonId: breakingBadSeason2.id,
        episodeNumber: 2,
        title: "Grilled",
        description: "Walt and Jesse find themselves trapped with an unhinged Tuco. Meanwhile, the DEA has a lead that could them straight to Walt and Jesse.",
        duration: 48,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/5Hkz4KiCVZjVd7YEYJUmLvKATQS.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s02e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s02e02-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s02e02-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s02e02-4k.mp4",
      },
      {
        seasonId: breakingBadSeason2.id,
        episodeNumber: 3,
        title: "Bit by a Dead Bee",
        description: "Walt and Jesse try to cover their tracks and return to their normal lives. Walt's health is in serious question, and Jesse's reputation in the drug world is compromised.",
        duration: 47,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/5KWRRh8JeQFYGJjHbr5OM4JnSBn.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s02e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s02e03-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s02e03-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s02e03-4k.mp4",
      },
      {
        seasonId: breakingBadSeason2.id,
        episodeNumber: 4,
        title: "Down",
        description: "Skyler keeps Walt out of the house, Jesse loses his house, and Walt loses his resolve.",
        duration: 47,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/5UkzNSOK561CCuGaFfs6uDGst4Y.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s02e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s02e04-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s02e04-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s02e04-4k.mp4",
      },
      {
        seasonId: breakingBadSeason2.id,
        episodeNumber: 5,
        title: "Breakage",
        description: "Walt and Jesse decide to start their own distribution network, while Hank deals with the trauma of his encounter with Tuco.",
        duration: 47,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/4Yy5kiNGcBKgCDDyR8N1KmHgH7J.jpg",
        videoUrl: "https://example.com/shows/breaking-bad/s02e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/breaking-bad/s02e05-sd.mp4",
        videoHD: "https://example.com/shows/breaking-bad/s02e05-hd.mp4",
        video4K: "https://example.com/shows/breaking-bad/s02e05-4k.mp4",
      },
    ]
  });

  // 18. Game of Thrones (TV Show)
  const gameOfThrones = await prisma.content.create({
    data: {
      title: "Game of Thrones",
      description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
      type: ContentType.TV_SHOW,
      releaseYear: 2011,
      maturityRating: MaturityRating.TV_MA,
      posterImage: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
      trailerType: TrailerType.URL,
      featured: true,
      trending: true,
      newRelease: false,
      studio: "HBO",
      language: "en",
      country: "United States",
      awards: "59 Primetime Emmy Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de", "it"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh", "ar", "ru"],
      viewCount: 2500000,
      averageRating: 4.8,
      likeCount: 2300000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id },
          { genreId: genres.find(g => g.name === "Fantasy")!.id },
          { genreId: genres.find(g => g.name === "Adventure")!.id }
        ]
      }
    }
  });

  // Create seasons and episodes for Game of Thrones
  const gotSeason1 = await prisma.season.create({
    data: {
      showId: gameOfThrones.id,
      seasonNumber: 1,
      title: "Season 1",
      overview: "Trouble is brewing in the Seven Kingdoms of Westeros. For the driven inhabitants of this visionary world, control of Westeros' Iron Throne holds the lure of great power.",
      posterImage: "https://image.tmdb.org/t/p/w500/zwaj4egrhnXOBIit1tyb4Sbt3KP.jpg",
      releaseYear: 2011,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: gotSeason1.id,
        episodeNumber: 1,
        title: "Winter Is Coming",
        description: "Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Eddard Stark, to take Jon's place. Across the sea, Viserys Targaryen plans to wed his sister to a nomadic warlord in exchange for an army.",
        duration: 62,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/wrGWeW4WKxnaeA8sxJb2T9O6ryo.jpg",
        videoUrl: "https://example.com/shows/game-of-thrones/s01e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/game-of-thrones/s01e01-sd.mp4",
        videoHD: "https://example.com/shows/game-of-thrones/s01e01-hd.mp4",
        video4K: "https://example.com/shows/game-of-thrones/s01e01-4k.mp4",
      },
      {
        seasonId: gotSeason1.id,
        episodeNumber: 2,
        title: "The Kingsroad",
        description: "While Bran recovers from his fall, Ned takes only his daughters to King's Landing. Jon Snow goes with his uncle Benjen to The Wall. Tyrion joins them.",
        duration: 56,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/icjOgl5F9DhysOEo6Six2Qfwcu2.jpg",
        videoUrl: "https://example.com/shows/game-of-thrones/s01e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/game-of-thrones/s01e02-sd.mp4",
        videoHD: "https://example.com/shows/game-of-thrones/s01e02-hd.mp4",
        video4K: "https://example.com/shows/game-of-thrones/s01e02-4k.mp4",
      },
      {
        seasonId: gotSeason1.id,
        episodeNumber: 3,
        title: "Lord Snow",
        description: "Jon begins his training with the Night's Watch. Ned confronts his past and future at King's Landing. Daenerys finds herself at odds with Viserys.",
        duration: 58,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/4vCYVtIhiYSUry1lviA7CKPUB5Z.jpg",
        videoUrl: "https://example.com/shows/game-of-thrones/s01e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/game-of-thrones/s01e03-sd.mp4",
        videoHD: "https://example.com/shows/game-of-thrones/s01e03-hd.mp4",
        video4K: "https://example.com/shows/game-of-thrones/s01e03-4k.mp4",
      },
      {
        seasonId: gotSeason1.id,
        episodeNumber: 4,
        title: "Cripples, Bastards, and Broken Things",
        description: "Eddard investigates Jon Arryn's murder. Jon befriends Samwell Tarly, a coward who has come to join the Night's Watch.",
        duration: 56,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/AprNYUAS2AJ3xVgg7Wwt00GVRJe.jpg",
        videoUrl: "https://example.com/shows/game-of-thrones/s01e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/game-of-thrones/s01e04-sd.mp4",
        videoHD: "https://example.com/shows/game-of-thrones/s01e04-hd.mp4",
        video4K: "https://example.com/shows/game-of-thrones/s01e04-4k.mp4",
      },
      {
        seasonId: gotSeason1.id,
        episodeNumber: 5,
        title: "The Wolf and the Lion",
        description: "Catelyn has captured Tyrion and plans to bring him to her sister, Lysa Arryn, at The Vale, to be tried for his, supposed, crimes against Bran. Robert plans to have Daenerys killed, but Eddard refuses to be a part of it and quits.",
        duration: 55,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/5tYaEHRxTmXJYPZ8B5gD5nyNvvR.jpg",
        videoUrl: "https://example.com/shows/game-of-thrones/s01e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/game-of-thrones/s01e05-sd.mp4",
        videoHD: "https://example.com/shows/game-of-thrones/s01e05-hd.mp4",
        video4K: "https://example.com/shows/game-of-thrones/s01e05-4k.mp4",
      },
    ]
  });

  // 19. The Mandalorian (TV Show)
  const mandalorian = await prisma.content.create({
    data: {
      title: "The Mandalorian",
      description: "After the fall of the Galactic Empire, a lone gunfighter makes his way through the lawless galaxy with his foundling, Grogu.",
      type: ContentType.TV_SHOW,
      releaseYear: 2019,
      maturityRating: MaturityRating.TV_14,
      posterImage: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=aOC8E8z_ifw",
      trailerType: TrailerType.URL,
      featured: true,
      trending: true,
      newRelease: true,
      studio: "Disney+",
      language: "en",
      country: "United States",
      awards: "14 Primetime Emmy Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de", "it", "ja"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh", "ar", "ru"],
      viewCount: 1900000,
      averageRating: 4.7,
      likeCount: 1800000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Sci-Fi")!.id },
          { genreId: genres.find(g => g.name === "Action")!.id },
          { genreId: genres.find(g => g.name === "Adventure")!.id }
        ]
      }
    }
  });

  // Create seasons and episodes for The Mandalorian
  const mandalorianSeason1 = await prisma.season.create({
    data: {
      showId: mandalorian.id,
      seasonNumber: 1,
      title: "Season 1",
      overview: "After the stories of Jango and Boba Fett, another warrior emerges in the Star Wars universe. The Mandalorian is set after the fall of the Empire and before the emergence of the First Order.",
      posterImage: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
      releaseYear: 2019,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: mandalorianSeason1.id,
        episodeNumber: 1,
        title: "Chapter 1: The Mandalorian",
        description: "A Mandalorian bounty hunter tracks a target for a well-paying client.",
        duration: 39,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/6Hk8J7dKbXz7oJ7ZyUt8DPC8tIl.jpg",
        videoUrl: "https://example.com/shows/mandalorian/s01e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/mandalorian/s01e01-sd.mp4",
        videoHD: "https://example.com/shows/mandalorian/s01e01-hd.mp4",
        video4K: "https://example.com/shows/mandalorian/s01e01-4k.mp4",
      },
      {
        seasonId: mandalorianSeason1.id,
        episodeNumber: 2,
        title: "Chapter 2: The Child",
        description: "Target in hand, the Mandalorian must now contend with scavengers.",
        duration: 32,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/zDxVHmiphX8Nc6c0nVrXUGc0jXZ.jpg",
        videoUrl: "https://example.com/shows/mandalorian/s01e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/mandalorian/s01e02-sd.mp4",
        videoHD: "https://example.com/shows/mandalorian/s01e02-hd.mp4",
        video4K: "https://example.com/shows/mandalorian/s01e02-4k.mp4",
      },
      {
        seasonId: mandalorianSeason1.id,
        episodeNumber: 3,
        title: "Chapter 3: The Sin",
        description: "The battered Mandalorian returns to his client for reward.",
        duration: 37,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/6Hk8J7dKbXz7oJ7ZyUt8DPC8tIl.jpg",
        videoUrl: "https://example.com/shows/mandalorian/s01e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/mandalorian/s01e03-sd.mp4",
        videoHD: "https://example.com/shows/mandalorian/s01e03-hd.mp4",
        video4K: "https://example.com/shows/mandalorian/s01e03-4k.mp4",
      },
      {
        seasonId: mandalorianSeason1.id,
        episodeNumber: 4,
        title: "Chapter 4: Sanctuary",
        description: "The Mandalorian teams up with an ex-soldier to protect a village from raiders.",
        duration: 41,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/6Hk8J7dKbXz7oJ7ZyUt8DPC8tIl.jpg",
        videoUrl: "https://example.com/shows/mandalorian/s01e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/mandalorian/s01e04-sd.mp4",
        videoHD: "https://example.com/shows/mandalorian/s01e04-hd.mp4",
        video4K: "https://example.com/shows/mandalorian/s01e04-4k.mp4",
      },
      {
        seasonId: mandalorianSeason1.id,
        episodeNumber: 5,
        title: "Chapter 5: The Gunslinger",
        description: "The Mandalorian helps a rookie bounty hunter who is in over his head.",
        duration: 35,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/6Hk8J7dKbXz7oJ7ZyUt8DPC8tIl.jpg",
        videoUrl: "https://example.com/shows/mandalorian/s01e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/mandalorian/s01e05-sd.mp4",
        videoHD: "https://example.com/shows/mandalorian/s01e05-hd.mp4",
        video4K: "https://example.com/shows/mandalorian/s01e05-4k.mp4",
      },
    ]
  });

  // 20. The Queen's Gambit (TV Show)
  const queensGambit = await prisma.content.create({
    data: {
      title: "The Queen's Gambit",
      description: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA. But child stardom comes at a price.",
      type: ContentType.TV_SHOW,
      releaseYear: 2020,
      maturityRating: MaturityRating.TV_MA,
      posterImage: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",
      backdropImage: "https://image.tmdb.org/t/p/original/34OGjFEbHj0E3lE2w0iTUVq0CBz.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=CDrieqwSdgI",
      trailerType: TrailerType.URL,
      featured: true,
      trending: true,
      newRelease: true,
      studio: "Netflix",
      language: "en",
      country: "United States",
      awards: "11 Primetime Emmy Awards",
      hasSD: true,
      hasHD: true,
      has4K: true,
      hasHDR: true,
      audioLanguages: ["en", "es", "fr", "de", "it"],
      subtitleLanguages: ["en", "es", "fr", "de", "it", "ja", "zh", "ar", "ru"],
      viewCount: 1200000,
      averageRating: 4.8,
      likeCount: 1100000,
      genres: {
        create: [
          { genreId: genres.find(g => g.name === "Drama")!.id }
        ]
      }
    }
  });

  // Create seasons and episodes for The Queen's Gambit
  const queensGambitSeason1 = await prisma.season.create({
    data: {
      showId: queensGambit.id,
      seasonNumber: 1,
      title: "Limited Series",
      overview: "In a 1950s orphanage, a young girl reveals an astonishing talent for chess and begins an unlikely journey to stardom while grappling with addiction.",
      posterImage: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",
      releaseYear: 2020,
    }
  });

  await prisma.episode.createMany({
    data: [
      {
        seasonId: queensGambitSeason1.id,
        episodeNumber: 1,
        title: "Openings",
        description: "Sent to an orphanage at age 9, Beth develops an uncanny knack for chess and a growing dependency on the green tranquilizers given to the children.",
        duration: 60,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/xJfaWJpWzAhYgkVbK3QYT0aNAUB.jpg",
        videoUrl: "https://example.com/shows/queens-gambit/s01e01.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/queens-gambit/s01e01-sd.mp4",
        videoHD: "https://example.com/shows/queens-gambit/s01e01-hd.mp4",
        video4K: "https://example.com/shows/queens-gambit/s01e01-4k.mp4",
      },
      {
        seasonId: queensGambitSeason1.id,
        episodeNumber: 2,
        title: "Exchanges",
        description: "Suddenly plunged into a confusing new life in suburbia, teenage Beth studies her high school classmates and hatches a plan to enter a chess tournament.",
        duration: 60,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/xJfaWJpWzAhYgkVbK3QYT0aNAUB.jpg",
        videoUrl: "https://example.com/shows/queens-gambit/s01e02.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/queens-gambit/s01e02-sd.mp4",
        videoHD: "https://example.com/shows/queens-gambit/s01e02-hd.mp4",
        video4K: "https://example.com/shows/queens-gambit/s01e02-4k.mp4",
      },
      {
        seasonId: queensGambitSeason1.id,
        episodeNumber: 3,
        title: "Doubled Pawns",
        description: "The trip to Cincinnati launches Beth and her mother into a whirlwind of travel and press coverage. Beth sets her sights on the U.S. Open in Las Vegas.",
        duration: 60,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/xJfaWJpWzAhYgkVbK3QYT0aNAUB.jpg",
        videoUrl: "https://example.com/shows/queens-gambit/s01e03.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/queens-gambit/s01e03-sd.mp4",
        videoHD: "https://example.com/shows/queens-gambit/s01e03-hd.mp4",
        video4K: "https://example.com/shows/queens-gambit/s01e03-4k.mp4",
      },
      {
        seasonId: queensGambitSeason1.id,
        episodeNumber: 4,
        title: "Middle Game",
        description: "Russian class opens the door to a new social scene for Beth, but she wants more. A night with Benny in New York defies her expectations.",
        duration: 60,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/xJfaWJpWzAhYgkVbK3QYT0aNAUB.jpg",
        videoUrl: "https://example.com/shows/queens-gambit/s01e04.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/queens-gambit/s01e04-sd.mp4",
        videoHD: "https://example.com/shows/queens-gambit/s01e04-hd.mp4",
        video4K: "https://example.com/shows/queens-gambit/s01e04-4k.mp4",
      },
      {
        seasonId: queensGambitSeason1.id,
        episodeNumber: 5,
        title: "Fork",
        description: "Back home in Kentucky, a shaken Beth reconnects with a former opponent who offers to help sharpen her game ahead of the U.S. Championship.",
        duration: 60,
        thumbnailImage: "https://image.tmdb.org/t/p/w500/xJfaWJpWzAhYgkVbK3QYT0aNAUB.jpg",
        videoUrl: "https://example.com/shows/queens-gambit/s01e05.mp4",
        videoSourceType: VideoSourceType.URL,
        videoSD: "https://example.com/shows/queens-gambit/s01e05-sd.mp4",
        videoHD: "https://example.com/shows/queens-gambit/s01e05-hd.mp4",
        video4K: "https://example.com/shows/queens-gambit/s01e05-4k.mp4",
      },
    ]
  });

// At the end of your main function, after creating all content:

  // Log all created content
  const allMovies = [
    inception,
    shawshank,
    darkKnight,
    pulpFiction,
    matrix,
    interstellar,
    godfather,
    fightClub,
    forrestGump,
    silenceOfTheLambs,
    parasite,
    joker,
    avengersEndgame,
    getOut
  ];

  const allTvShows = [
    strangerThings,
    breakingBad, 
    gameOfThrones,
    queensGambit
  ];

  console.log(`Created ${allMovies.length} movies and ${allTvShows.length} TV shows`);
  
  // You can also log details about each content item
  console.log("Movies:", allMovies.map(movie => movie.title));
  console.log("TV Shows:", allTvShows.map(show => show.title));

  console.log("Database seeded successfully!");}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

