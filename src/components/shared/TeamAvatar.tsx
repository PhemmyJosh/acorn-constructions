import Image from "next/image";

interface TeamAvatarProps {
  name: string;
  image?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamAvatar({ name, image, className = "" }: TeamAvatarProps) {
  if (image) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full ${className}`}>
        <Image src={image} alt={name} fill className="object-cover object-top" />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-acorn-charcoal ${className}`}
    >
      <span className="text-2xl font-semibold text-acorn-gold">{getInitials(name)}</span>
    </div>
  );
}
