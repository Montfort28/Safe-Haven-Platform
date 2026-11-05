import type { ComponentType } from 'react';

export type StaggeredMenuItem = {
  label: string;
  link: string;
  ariaLabel?: string;
};

export type StaggeredMenuProps = {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
};

declare const StaggeredMenu: ComponentType<StaggeredMenuProps>;

export { StaggeredMenu };
export default StaggeredMenu;
