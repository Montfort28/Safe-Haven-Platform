type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span
      aria-label="Safe Haven"
      className={`brand-logo ${className}`}
      role="img"
    />
  );
}
