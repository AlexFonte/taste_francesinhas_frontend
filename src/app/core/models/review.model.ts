export interface Review {
  id: number;
  francesinhaId: number;
  userName: string;
  scoreFlavor: number;
  scoreSauce: number;
  scoreBread: number;
  scorePresentation: number;
  avgScore: number;
  comment: string;
  createdAt: string;
}