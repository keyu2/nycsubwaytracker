import Image from "next/image";
import { getBullet } from "../lib/routes";

export default function RouteBullet({ routeId, size = 32, alt, ...props }) {
  return (
    <Image
      src={getBullet(routeId)}
      alt={alt ?? `${routeId} train`}
      width={size}
      height={size}
      loading="eager"
      unoptimized
      {...props}
    />
  );
}
