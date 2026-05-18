import { Francesinha, FrancesinhaStatus, FrancesinhaType } from './francesinha.model';

export interface UserStats {
  reviewsCount:   number;
  proposalsCount: number;
}

// Review del usuario con datos minimos de la francesinha valorada
export interface MyReview {
  id:                 number;
  scoreFlavor:        number;
  scoreSauce:         number;
  scoreBread:         number;
  scorePresentation:  number;
  avgScore:           number;
  comment:            string;
  photoUrl?:          string;
  createdAt:          string;
  francesinhaId:      number;
  francesinhaName:    string;
  francesinhaType:    FrancesinhaType;
  francesinhaStatus:  FrancesinhaStatus;
  restaurantName:     string;
  restaurantCity:     string;
}

// Review propia inline dentro de una propuesta - sin info de francesinha
export interface ProposalReview {
  id:                number;
  scoreFlavor:       number;
  scoreSauce:        number;
  scoreBread:        number;
  scorePresentation: number;
  avgScore:          number;
  comment:           string;
  photoUrl?:         string;
  createdAt:         string;
}

export interface MyProposal extends Omit<Francesinha, 'proposedByEmail'> {
  userReview?: ProposalReview | null;
}
