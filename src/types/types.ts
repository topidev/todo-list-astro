import type { Timestamp } from "firebase/firestore";

export type Status = 'new' | 'inProgress' | 'paused' | 'finished' | 'dropped';


export interface Idea {
  id: string;
  text: string;
  status: Status;
}

export interface Idea {
  id: string
  text: string
  status: Status
  createdAt?: Timestamp | Date
  createdBy?: string
}

export interface Board {
  id: string
  name: string
  owner: string // userId del creador
  members: string[] // array de userIds con acceso
  createdAt: Timestamp | Date
}

export interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  boards: string[] // IDs de los boards a los que tiene acceso
  updatedAt?: Date
}