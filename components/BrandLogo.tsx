type BrandLogoProps = {
  className?: string;
  withName?: boolean;
};

export default function BrandLogo({ className = '', withName = false }: BrandLogoProps) {
  const mark = (
    <span
      aria-label="Safe Haven"
      className={`brand-logo ${className}`}
      role="img"
    />
  );

  if (!withName) return mark;

  return (
    <span className="brand-lockup">
      {mark}
      <span className="brand-wordmark" aria-hidden="true">Safe Haven</span>
    </span>
  );
}
