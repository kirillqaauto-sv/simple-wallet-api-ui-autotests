export interface User {
  id: number;
  uid: string;
  username: string;
  balance: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  senderId: number | null;
  receiverId: number | null;
  amount: string;
  category: string;
  description: string | null;
  createdAt: string;
}

export interface SavingsAccount {
  id: number;
  userId: number;
  name: string;
  balance: string;
  target: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
}
