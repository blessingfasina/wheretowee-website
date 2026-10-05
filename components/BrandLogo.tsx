import Image from 'next/image';

type BrandLogoProps = {
  /** Rendered width/height in pixels. */
  size?: number;
  className?: string;
  priority?: boolean;
};

/**
 * Official Where To Wee app icon mark — use beside the brand name
 * instead of the toilet emoji.
 */
export default function BrandLogo({
  size = 32,
  className = '',
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/icon-192.png"
      alt=""
      width={size}
      height={size}
      className={`rounded-lg shrink-0 ${className}`.trim()}
      priority={priority}
      aria-hidden
    />
  );
}
