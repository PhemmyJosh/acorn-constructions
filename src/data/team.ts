export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  shortBio?: string;
  bio?: string[];
}

// Members without an `image` render an initials avatar (see TeamAvatar) until
// a real headshot is provided.
export const team: TeamMember[] = [
  {
    name: "Mark Acorn",
    role: "Founder & CEO",
    image: "/mark-acorn.jpg",
    shortBio:
      "Mark Acorn is the founder and CEO of Acorn Construction, a Lloydminster-based builder specializing in residential, commercial, and post frame construction. A Red Seal journeyman carpenter since 2002, he founded Acorn Construction in 2011 as a one-man operation and has grown it into multiple crews across Alberta and Saskatchewan. For Mark, the real reward is in the homes built for great clients and the relationships made along the way.",
    bio: [
      "Mark Acorn is the founder and CEO of Acorn Construction, a Lloydminster-based builder specializing in quality residential, commercial, and post frame construction. A Red Seal journeyman carpenter, he's been in the trade since 2002 — what started as a summer job quickly became a lifelong calling. From helping with small projects when he was younger to working on multi-million dollar commercial projects, Mark has always enjoyed every aspect of the process.",
      "Born and raised in Lloydminster, Alberta, Mark is proud to call it home and to raise his family in the same area. When he's not on a job site, you'll likely find him at the lake in the summer — fishing and spending time with friends and family. Mark enjoys teaching and passing knowledge on to the younger generation, and has worked with Lakeland College and local high schools to help foster a love of building in students.",
      "Coming from a family of tradesmen, Mark has always found joy in working with his hands and being outdoors. He's built a career mostly in residential construction, with time spent in commercial and concrete work along the way. He earned his Red Seal journeyman ticket in 2006 and founded Acorn Construction in 2011, starting as a one-man operation. Since then, the company has grown steadily to multiple crews across multiple areas — and it's still growing.",
      "At Acorn, the philosophy is simple: take pride in everything you do and deliver a top-quality product every time, no matter the size of the job. For Mark, the real reward is in the houses built for great clients and the relationships made along the way.",
    ],
  },
  {
    name: "Jeremy McColm",
    role: "Operations Manager",
  },
  {
    name: "Laura Acorn",
    role: "Office Manager",
  },
  {
    name: "Blessing Fadumila",
    role: "Operations Coordinator",
  },
];
