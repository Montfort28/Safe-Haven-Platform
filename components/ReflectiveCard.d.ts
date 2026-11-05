import type { ComponentType, CSSProperties, ReactNode } from 'react';

export type ReflectiveCardProps = {
  name?: string;
  role?: string;
  badge?: string;
  status?: string;
  statusColor?: string;
  idLabel?: string;
  idValue?: string;
  children?: ReactNode;
  theme?: 'dark' | 'light' | 'haven';
  videoSrc?: string;
  webcam?: boolean;
  onWebcamError?: (error: Error) => void;
  tint?: string;
  metalness?: number;
  roughness?: number;
  blurStrength?: number;
  grayscale?: number;
  warp?: number;
  warpScale?: number;
  shine?: number;
  bevel?: number;
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  intro?: boolean;
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
  style?: CSSProperties;
};

declare const ReflectiveCard: ComponentType<ReflectiveCardProps>;

export { ReflectiveCard };
export default ReflectiveCard;
