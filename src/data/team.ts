export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export const team: TeamMember[] = [
  {
    name: "Marcus Bellweather",
    role: "Founder & President",
    image: "https://placehold.co/500x600/292524/e7e5e4?text=Marcus+B.",
  },
  {
    name: "Elena Cortes",
    role: "VP of Construction",
    image: "https://placehold.co/500x600/292524/e7e5e4?text=Elena+C.",
  },
  {
    name: "Sam Whitfield",
    role: "Director of Commercial Projects",
    image: "https://placehold.co/500x600/292524/e7e5e4?text=Sam+W.",
  },
  {
    name: "Nadia Reyes",
    role: "Client Relations Manager",
    image: "https://placehold.co/500x600/292524/e7e5e4?text=Nadia+R.",
  },
];
