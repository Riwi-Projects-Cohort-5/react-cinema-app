export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface CineFlashWindow {
  startAt: string;
  endAt: string;
}

export interface CineFlashMovie {
  id: string;
  title: string;
  posterUrl: string;
}

export interface CineFlashCinema {
  id: string;
  name: string;
}

export interface CineFlashFunction {
  movie: CineFlashMovie;
  functionId: string;
  cinema: CineFlashCinema;
  format: string;
  startAt: string;
  previousPrice: MoneyAmount;
  cineflashPrice: MoneyAmount;
  remainingTickets: number;
}

export interface CineFlashResponse {
  active: boolean;
  discountPercent: number;
  maxTicketsPerPurchase: number;
  notAccumulableWith: string[];
  window: CineFlashWindow;
  remainingSeconds: number;
  terms: string;
  functions: CineFlashFunction[];
}
