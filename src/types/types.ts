export interface Idea {
  id: string;
  text: string;
  status: Status;
}

export type Status = 'new' | 'inProgress' | 'paused' | 'finished' | 'dropped';