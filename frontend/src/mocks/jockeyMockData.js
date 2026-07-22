// Mock Database for Jockey Frontend

export const initialJockeyProfile = {
  fullName: "Ryan Moore",
  email: "jockey@racing.com",
  phoneNumber: "0987654321",
  identityNumber: "030096009876",
  dateOfBirth: "1990-05-14",
  licenseNumber: "LIC-JOC-1290",
  height: 165, // in cm
  weight: 54, // in kg
  experienceYears: 8,
  rankingScore: 1200,
  winRate: 58,
  matchesPlayed: 320,
  bankAccount: "1023456789 (Vietcombank)",
  walletBalance: 450000000, // in VND
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  description: "Speed racing record holder, specialist in mid-distance and sprint final stretches.",
  avatarZoom: 1,
  avatarOffsetX: 0,
  avatarOffsetY: 0
};

export const initialJockeyInvitations = [
  {
    id: "INV001",
    ownerId: 888,
    ownerName: "Tran The Anh",
    stableName: "Heavenly Horse Stable",
    horseName: "Silver Cloud",
    horseBreed: "Arabian",
    tournamentId: "T002",
    tournamentName: "Royal Ascot Series 2026 - Qualifier Round 1",
    raceDate: "2026-07-18",
    raceTime: "14:30",
    prizePool: "8,000,000 GBP",
    jockeyShare: 20, // 20% share
    ownerShare: 80,
    status: "PENDING",
    notes: "Silver Cloud needs a calm jockey to control the pace. Looking forward to collaborating with you!"
  },
  {
    id: "INV002",
    ownerId: 777,
    ownerName: "Pham Thuy Linh",
    stableName: "Platinum Stable",
    horseName: "Storm Weaver",
    horseBreed: "Quarter Horse",
    tournamentId: "T003",
    tournamentName: "Binh Duong International Championship 2026 - Qualifier Round 2",
    raceDate: "2026-08-15",
    raceTime: "09:00",
    prizePool: "5,000,000,000 VND",
    jockeyShare: 30, // 30% share
    ownerShare: 70,
    status: "PENDING",
    notes: "1200m cup competition at Dai Nam track. We would love to have Ryan join our team."
  }
];

export const initialJockeyTransactions = [
  {
    id: "TXJ001",
    date: "2026-05-28 15:30:10",
    type: "EARNINGS",
    horse: "Midnight Runner",
    event: "Jockey Share (30%) - Dai Nam Cup 2026",
    amount: 45000000, // +45,000,000 VND
  },
  {
    id: "TXJ002",
    date: "2026-04-12 10:00:00",
    type: "EARNINGS",
    horse: "Silver Cloud",
    event: "Jockey Share (30%) - Phu Tho Open",
    amount: 9000000, // +9,000,000 VND
  },
  {
    id: "TXJ003",
    date: "2026-06-01 08:30:00",
    type: "WITHDRAWAL",
    event: "Withdraw to Bank Account",
    amount: -100000000, // -100,000,000 VND
  }
];

export const initialJockeyRaceHistory = [
  {
    id: "RHJ001",
    date: "2026-05-28",
    tournament: "Dai Nam Cup 2026",
    raceRound: "A-League Finals - 1200m",
    horseName: "Midnight Runner",
    ownerName: "Lam Hoang Kiet",
    placement: 1,
    finishTime: "1:09.45",
    prizeMoney: 150000000,
    payout: 45000000,
    sharePercent: 30
  },
  {
    id: "RHJ002",
    date: "2026-04-12",
    tournament: "Phu Tho Horse Racing Open",
    raceRound: "Qualifying Round 2 - 1400m",
    horseName: "Silver Cloud",
    ownerName: "Lam Hoang Kiet",
    placement: 3,
    finishTime: "1:25.12",
    prizeMoney: 30000000,
    payout: 9000000,
    sharePercent: 30
  }
];

export const initialJockeysLeaderboard = [
  { rank: 1, fullName: "Ryan Moore", winRate: 58, rankingScore: 1200, experienceYears: 8, isCurrentUser: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { rank: 2, fullName: "Lafitt Dettori", winRate: 65, rankingScore: 1150, experienceYears: 12, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { rank: 3, fullName: "Nguyen Van Hung", winRate: 40, rankingScore: 980, experienceYears: 4, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { rank: 4, fullName: "Le Minh Tuan", winRate: 45, rankingScore: 920, experienceYears: 6, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" },
  { rank: 5, fullName: "Tran Quoc Nam", winRate: 35, rankingScore: 810, experienceYears: 3, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" }
];

export const initialJockeyFriends = [
  {
    userId: 999,
    connectionId: 1001,
    fullName: "Lam Hoang Kiet",
    email: "kietlh@prestigeturf.com",
    phone: "0901234567",
    role: "HORSE_OWNER",
    friendStatus: "FRIEND",
    stableName: "Royal Stable",
    stableAddress: "Binh Duong Boulevard, Thu Dau Mot, Binh Duong",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    description: "Royal Stable specializes in providing the finest thoroughbred horses in the world."
  },
  {
    userId: 888,
    connectionId: 1002,
    fullName: "Tran The Anh",
    email: "theanh@heavenly.com",
    phone: "0912345678",
    role: "HORSE_OWNER",
    friendStatus: "FRIEND",
    stableName: "Heavenly Horse Stable",
    stableAddress: "Cu Chi, Ho Chi Minh City",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    description: "Owner of Heavenly Horse Stable, specializing in importing and breeding European thoroughbreds."
  }
];

export const initialJockeyDirectory = [
  {
    userId: 999,
    connectionId: 1001,
    fullName: "Lam Hoang Kiet",
    email: "kietlh@prestigeturf.com",
    phone: "0901234567",
    role: "HORSE_OWNER",
    friendStatus: "FRIEND",
    stableName: "Royal Stable",
    stableAddress: "Binh Duong Boulevard, Thu Dau Mot, Binh Duong",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    description: "Royal Stable specializes in providing the finest thoroughbred horses in the world."
  },
  {
    userId: 888,
    connectionId: 1002,
    fullName: "Tran The Anh",
    email: "theanh@heavenly.com",
    phone: "0912345678",
    role: "HORSE_OWNER",
    friendStatus: "FRIEND",
    stableName: "Heavenly Horse Stable",
    stableAddress: "Cu Chi, Ho Chi Minh City",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    description: "Owner of Heavenly Horse Stable, specializing in importing and breeding European thoroughbreds."
  },
  {
    userId: 777,
    connectionId: 1003,
    fullName: "Pham Thuy Linh",
    email: "thuylinh@platinum.com",
    phone: "0934567890",
    role: "HORSE_OWNER",
    friendStatus: "PENDING_RECEIVED",
    stableName: "Platinum Stable",
    stableAddress: "Dong Anh, Hanoi",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    description: "Platinum Stable - Nurturing top speed and endurance racehorses."
  },
  {
    userId: 666,
    connectionId: 1004,
    fullName: "Nguyen Van Hung",
    email: "hungnv@jockey.com",
    phone: "0945678901",
    role: "JOCKEY",
    friendStatus: "PENDING_SENT",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    experienceYears: 4,
    winRate: 40,
    matchesPlayed: 120,
    rankingScore: 980,
    licenseNumber: "LIC-JOC-4456",
    description: "Promising young jockey with a calm racing style."
  },
  {
    userId: 555,
    connectionId: 1005,
    fullName: "Le Minh Tuan",
    email: "tuanlm@jockey.com",
    phone: "0956789012",
    role: "JOCKEY",
    friendStatus: "NONE",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    experienceYears: 6,
    winRate: 45,
    matchesPlayed: 180,
    rankingScore: 920,
    licenseNumber: "LIC-JOC-8872",
    description: "Expert in obstacles and pacing control."
  }
];

