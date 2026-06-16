export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  relativeTime: string;
  text: string;
  source: string;
}

export const reviews: Review[] = [
  {
    id: "rev-001",
    author: "Priya Nair",
    initials: "PN",
    rating: 5,
    relativeTime: "2 days ago",
    text: "FieldForce 360 turned our dispatch chaos into a calm, predictable operation. Technicians arrive on time and the live tracking keeps our clients informed without a single phone call.",
    source: "Google",
  },
  {
    id: "rev-002",
    author: "Marcus Vance",
    initials: "MV",
    rating: 5,
    relativeTime: "1 week ago",
    text: "The AI routing alone paid for the subscription. We shaved nearly 30% off travel time across our zones and the analytics dashboard makes weekly reviews effortless.",
    source: "Google",
  },
  {
    id: "rev-003",
    author: "Sarah Chen",
    initials: "SC",
    rating: 4,
    relativeTime: "3 weeks ago",
    text: "Onboarding was smooth and the geo-fenced check-ins are a game changer for accountability. I'd love a few more export options, but the team ships updates fast.",
    source: "Google",
  },
  {
    id: "rev-004",
    author: "Diego Alvarez",
    initials: "DA",
    rating: 5,
    relativeTime: "1 month ago",
    text: "Support is responsive and genuinely helpful. The live alert feed means we catch delays before customers ever notice. Our satisfaction scores have climbed every month since switching.",
    source: "Google",
  },
  {
    id: "rev-005",
    author: "Hannah Whitfield",
    initials: "HW",
    rating: 5,
    relativeTime: "2 months ago",
    text: "A polished, executive-grade product. The glassmorphic dashboards look incredible on the boardroom screen and finally give leadership a single source of truth for field operations.",
    source: "Google",
  },
];

export const averageRating =
  reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);

export const totalReviews = reviews.length;
