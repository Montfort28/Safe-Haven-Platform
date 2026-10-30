import Image from 'next/image';

type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span
      aria-label="Safe Haven"
      className={`brand-logo ${className}`}
      role="img"
    >
      <Image
        src="/images/Safe%20haven%20logo.png"
        alt=""
        width={622}
        height={401}
        className="brand-logo-image"
      />
    </span>
  );
}
