export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  status: 'connected' | 'inputting' | 'ready';
  avatarColor: string;
}

export interface RoomState {
  code: string;
  category: string;
  status: 'waiting_for_participants' | 'collecting_preferences' | 'calculating_consensus';
  participants: Participant[];
}
