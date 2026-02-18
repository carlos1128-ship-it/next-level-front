
import type { ReactNode } from 'react';

export interface NavItem {
  path: string;
  name: string;
  // Fix: Changed return type from JSX.Element to ReactNode to resolve JSX namespace error.
  icon: (props: { className?: string }) => ReactNode;
  isPrimary?: boolean;
}

export interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  // Fix: Changed return type from JSX.Element to ReactNode to resolve JSX namespace error.
  icon: (props: { className?: string }) => ReactNode;
  color: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}
