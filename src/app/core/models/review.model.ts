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

export interface ReviewRequest {
  scoreFlavor:       number;
  scoreSauce:        number;
  scoreBread:        number;
  scorePresentation: number;
  comment:           string;
  // Solo se envia true cuando la review se crea junto con una propuesta de francesinha
  // (la francesinha estara en estado PENDING). En el resto de casos se omite.
  propuesta?:        boolean;
}