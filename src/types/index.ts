export interface Voter {
  id: string;
  name: string;
  voterId: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  manifesto: string;
}

export interface Election {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Vote {
  id: string;
  electionId: string;
  voterId: string;
  candidateId: string;
  timestamp: Date;
}