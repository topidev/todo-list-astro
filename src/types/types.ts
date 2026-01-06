export interface Idea {
  id: string;
  text: string;
  status: Status;
}

type Status = 'new' | 'inProgress' | 'onPaused' | 'finished' | 'dropped';