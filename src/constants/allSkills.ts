// LocalFelo - Complete Skills Database
// 70 skills covering ALL personas: students, parents, IT workers, jobless, skilled workers, creatives

export const ALL_SKILLS = [
  // 🎓 FOR STUDENTS (10 skills)
  { id: 1, name: 'Tutoring', slug: 'tutoring', emoji: '📚', persona: 'student', group: 'education' },
  { id: 2, name: 'Assignment Help', slug: 'assignment-help', emoji: '📝', persona: 'student', group: 'education' },
  { id: 3, name: 'Graphic Design', slug: 'graphic-design', emoji: '🎨', persona: 'student', group: 'creative' },
  { id: 4, name: 'Web Design', slug: 'web-design', emoji: '💻', persona: 'student', group: 'tech' },
  { id: 5, name: 'Photography', slug: 'photography', emoji: '📸', persona: 'student', group: 'creative' },
  { id: 6, name: 'Video Editing', slug: 'video-editing', emoji: '🎬', persona: 'student', group: 'creative' },
  { id: 7, name: 'Music Lessons', slug: 'music-lessons', emoji: '🎸', persona: 'student', group: 'education' },
  { id: 8, name: 'Event Organization', slug: 'event-organization', emoji: '🎯', persona: 'student', group: 'events' },
  { id: 9, name: 'Social Media', slug: 'social-media', emoji: '📱', persona: 'student', group: 'marketing' },
  { id: 10, name: 'Voice Over', slug: 'voice-over', emoji: '🎤', persona: 'student', group: 'creative' },

  // 👨‍👩‍👧 FOR PARENTS / HOMEMAKERS (10 skills)
  { id: 11, name: 'Cooking / Tiffin', slug: 'cooking', emoji: '🍳', persona: 'parent', group: 'home' },
  { id: 12, name: 'House Cleaning', slug: 'cleaning', emoji: '🧹', persona: 'parent', group: 'home' },
  { id: 13, name: 'Babysitting', slug: 'babysitting', emoji: '👶', persona: 'parent', group: 'care' },
  { id: 14, name: 'Laundry / Ironing', slug: 'laundry', emoji: '🧺', persona: 'parent', group: 'home' },
  { id: 15, name: 'Tailoring', slug: 'tailoring', emoji: '🧵', persona: 'parent', group: 'craft' },
  { id: 16, name: 'Baking / Cakes', slug: 'baking', emoji: '🍰', persona: 'parent', group: 'home' },
  { id: 17, name: 'Mehendi / Rangoli', slug: 'mehendi', emoji: '🎨', persona: 'parent', group: 'craft' },
  { id: 18, name: 'Beauty at Home', slug: 'beauty-home', emoji: '💇', persona: 'parent', group: 'care' },
  { id: 19, name: 'Elderly Care', slug: 'elderly-care', emoji: '👵', persona: 'parent', group: 'care' },
  { id: 20, name: 'Flower Decoration', slug: 'flower-decoration', emoji: '🌸', persona: 'parent', group: 'craft' },

  // 💼 FOR IT / OFFICE WORKERS (10 skills)
  { id: 21, name: 'Computer Repair', slug: 'computer-repair', emoji: '💻', persona: 'it', group: 'tech' },
  { id: 22, name: 'Mobile Repair', slug: 'mobile-repair', emoji: '📱', persona: 'it', group: 'tech' },
  { id: 23, name: 'Software Install', slug: 'software-install', emoji: '🖥️', persona: 'it', group: 'tech' },
  { id: 24, name: 'Data Entry', slug: 'data-entry', emoji: '📊', persona: 'it', group: 'office' },
  { id: 25, name: 'Document Format', slug: 'document-format', emoji: '📋', persona: 'it', group: 'office' },
  { id: 26, name: 'Presentation', slug: 'presentation', emoji: '🎥', persona: 'it', group: 'office' },
  { id: 27, name: 'Tech Support', slug: 'tech-support', emoji: '🔧', persona: 'it', group: 'tech' },
  { id: 28, name: 'Website Help', slug: 'website-help', emoji: '🌐', persona: 'it', group: 'tech' },
  { id: 29, name: 'Email Setup', slug: 'email-setup', emoji: '📧', persona: 'it', group: 'tech' },
  { id: 30, name: 'Cloud Setup', slug: 'cloud-setup', emoji: '☁️', persona: 'it', group: 'tech' },

  // 🏃 FOR JOBLESS / QUICK MONEY (10 skills)
  { id: 31, name: 'Delivery / Pickup', slug: 'delivery', emoji: '📦', persona: 'jobless', group: 'transport' },
  { id: 32, name: 'Driving / Drop', slug: 'driving', emoji: '🚗', persona: 'jobless', group: 'transport' },
  { id: 33, name: 'Quick Errands', slug: 'errands', emoji: '🏃', persona: 'jobless', group: 'transport' },
  { id: 34, name: 'Grocery Shopping', slug: 'shopping', emoji: '🛒', persona: 'jobless', group: 'transport' },
  { id: 35, name: 'Moving / Shifting', slug: 'moving', emoji: '📦', persona: 'jobless', group: 'transport' },
  { id: 36, name: 'Loading / Unloading', slug: 'loading', emoji: '🚚', persona: 'jobless', group: 'labor' },
  { id: 37, name: 'Airport Pickup', slug: 'airport-pickup', emoji: '🧳', persona: 'jobless', group: 'transport' },
  { id: 38, name: 'Crowd Management', slug: 'crowd-management', emoji: '🎪', persona: 'jobless', group: 'events' },
  { id: 39, name: 'Queue Standing', slug: 'queue-standing', emoji: '📋', persona: 'jobless', group: 'misc' },
  { id: 40, name: 'Form Filling', slug: 'form-filling', emoji: '✍️', persona: 'jobless', group: 'office' },

  // 🔧 FOR SKILLED WORKERS (10 skills)
  { id: 41, name: 'Plumbing', slug: 'plumbing', emoji: '🚰', persona: 'skilled', group: 'home-repair' },
  { id: 42, name: 'Electrical Work', slug: 'electrical', emoji: '⚡', persona: 'skilled', group: 'home-repair' },
  { id: 43, name: 'Painting', slug: 'painting', emoji: '🎨', persona: 'skilled', group: 'home-repair' },
  { id: 44, name: 'Carpentry', slug: 'carpentry', emoji: '🪵', persona: 'skilled', group: 'construction' },
  { id: 45, name: 'Masonry', slug: 'masonry', emoji: '🧱', persona: 'skilled', group: 'construction' },
  { id: 46, name: 'Appliance Repair', slug: 'appliance-repair', emoji: '🔧', persona: 'skilled', group: 'home-repair' },
  { id: 47, name: 'Construction', slug: 'construction', emoji: '🏗️', persona: 'skilled', group: 'construction' },
  { id: 48, name: 'Gardening', slug: 'gardening', emoji: '🪴', persona: 'skilled', group: 'home' },
  { id: 49, name: 'Car Washing', slug: 'car-washing', emoji: '🚗', persona: 'skilled', group: 'vehicle' },
  { id: 50, name: 'Bike Repair', slug: 'bike-repair', emoji: '🔩', persona: 'skilled', group: 'vehicle' },

  // 🎉 FOR CREATIVES / FREELANCERS (10 skills)
  { id: 51, name: 'Event Photography', slug: 'event-photography', emoji: '📸', persona: 'creative', group: 'events' },
  { id: 52, name: 'Videography', slug: 'videography', emoji: '🎥', persona: 'creative', group: 'events' },
  { id: 53, name: 'Event Decoration', slug: 'decoration', emoji: '🎈', persona: 'creative', group: 'events' },
  { id: 54, name: 'DJ / Music', slug: 'dj', emoji: '🎶', persona: 'creative', group: 'events' },
  { id: 55, name: 'Catering', slug: 'catering', emoji: '🍽️', persona: 'creative', group: 'events' },
  { id: 56, name: 'Anchor / Hosting', slug: 'hosting', emoji: '🎭', persona: 'creative', group: 'events' },
  { id: 57, name: 'Makeup Artist', slug: 'makeup', emoji: '💄', persona: 'creative', group: 'beauty' },
  { id: 58, name: 'Fashion Styling', slug: 'styling', emoji: '👗', persona: 'creative', group: 'beauty' },
  { id: 59, name: 'Content Writing', slug: 'writing', emoji: '✍️', persona: 'creative', group: 'marketing' },
  { id: 60, name: 'Brand Promotion', slug: 'promotion', emoji: '🎯', persona: 'creative', group: 'marketing' },

  // 🐕 FOR ANIMAL LOVERS (5 skills)
  { id: 61, name: 'Dog Walking', slug: 'dog-walking', emoji: '🐕', persona: 'animal', group: 'pets' },
  { id: 62, name: 'Pet Sitting', slug: 'pet-sitting', emoji: '🐱', persona: 'animal', group: 'pets' },
  { id: 63, name: 'Pet Grooming', slug: 'pet-grooming', emoji: '🐾', persona: 'animal', group: 'pets' },
  { id: 64, name: 'Bird Care', slug: 'bird-care', emoji: '🦜', persona: 'animal', group: 'pets' },
  { id: 65, name: 'Aquarium Care', slug: 'aquarium-care', emoji: '🐠', persona: 'animal', group: 'pets' },

  // 🏋️ FOR FITNESS ENTHUSIASTS (5 skills)
  { id: 66, name: 'Personal Training', slug: 'personal-training', emoji: '🏋️', persona: 'fitness', group: 'health' },
  { id: 67, name: 'Yoga Classes', slug: 'yoga', emoji: '🧘', persona: 'fitness', group: 'health' },
  { id: 68, name: 'Running Buddy', slug: 'running', emoji: '🏃', persona: 'fitness', group: 'health' },
  { id: 69, name: 'Boxing Coach', slug: 'boxing', emoji: '🥊', persona: 'fitness', group: 'health' },
  { id: 70, name: 'Sports Coaching', slug: 'sports-coaching', emoji: '🏸', persona: 'fitness', group: 'health' },
] as const;

export const SKILL_PERSONAS = {
  student: {
    name: 'Students',
    emoji: '🎓',
    color: '#DBEAFE',
    description: 'Perfect for college students earning pocket money',
    skills: ALL_SKILLS.filter(s => s.persona === 'student').map(s => s.slug),
  },
  parent: {
    name: 'Parents / Homemakers',
    emoji: '👨‍👩‍👧',
    color: '#FCE7F3',
    description: 'Home-based skills for parents and homemakers',
    skills: ALL_SKILLS.filter(s => s.persona === 'parent').map(s => s.slug),
  },
  it: {
    name: 'IT / Office Workers',
    emoji: '💻',
    color: '#E0E7FF',
    description: 'Tech and office skills for IT professionals',
    skills: ALL_SKILLS.filter(s => s.persona === 'it').map(s => s.slug),
  },
  jobless: {
    name: 'Quick Money Seekers',
    emoji: '🏃',
    color: '#D1FAE5',
    description: 'Simple tasks for anyone needing quick cash',
    skills: ALL_SKILLS.filter(s => s.persona === 'jobless').map(s => s.slug),
  },
  skilled: {
    name: 'Skilled Workers',
    emoji: '🔧',
    color: '#FED7AA',
    description: 'Professional trades and skilled labor',
    skills: ALL_SKILLS.filter(s => s.persona === 'skilled').map(s => s.slug),
  },
  creative: {
    name: 'Creatives / Freelancers',
    emoji: '🎨',
    color: '#FEF3C7',
    description: 'Creative and event-based opportunities',
    skills: ALL_SKILLS.filter(s => s.persona === 'creative').map(s => s.slug),
  },
  animal: {
    name: 'Animal Lovers',
    emoji: '🐕',
    color: '#FAE8FF',
    description: 'Pet care and animal services',
    skills: ALL_SKILLS.filter(s => s.persona === 'animal').map(s => s.slug),
  },
  fitness: {
    name: 'Fitness Enthusiasts',
    emoji: '🏋️',
    color: '#FFEDD5',
    description: 'Fitness and sports coaching',
    skills: ALL_SKILLS.filter(s => s.persona === 'fitness').map(s => s.slug),
  },
} as const;

export type Skill = typeof ALL_SKILLS[number];
export type PersonaType = keyof typeof SKILL_PERSONAS;

// Popular skills (shown by default if < 20)
export const POPULAR_SKILLS = [
  'delivery',
  'cooking',
  'cleaning',
  'tutoring',
  'driving',
  'computer-repair',
  'mobile-repair',
  'photography',
  'plumbing',
  'electrical',
  'graphic-design',
  'babysitting',
  'data-entry',
  'moving',
  'gardening',
  'event-photography',
  'makeup',
  'dog-walking',
] as const;

export function getSkillsByPersona(persona: PersonaType) {
  return ALL_SKILLS.filter(skill => skill.persona === persona);
}

export function getSkillBySlug(slug: string) {
  return ALL_SKILLS.find(skill => skill.slug === slug);
}

export function getPopularSkills() {
  return ALL_SKILLS.filter(skill => 
    POPULAR_SKILLS.includes(skill.slug as any)
  );
}
