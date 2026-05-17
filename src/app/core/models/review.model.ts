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
  // URL publica de la foto subida con la review. Optional porque no todas las reviews tienen foto.
  photoUrl?: string;
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