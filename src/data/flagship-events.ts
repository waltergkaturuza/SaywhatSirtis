// SAYWHAT Flagship Events Data Structure
// This contains all flagship events and their implementation partners

export interface ImplementationPartner {
  id: string;
  name: string;
  acronym: string;
  country: string;
  focusAreas: string[];
  description?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface EventDocument {
  id: string;
  name: string;
  category: 'concept' | 'budget' | 'planning' | 'implementation' | 'review';
  uploadDate: string;
  fileType: string;
  fileName: string;
  uploadedBy: string;
  version: number;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
}

export interface FlagshipEvent {
  id: string;
  name: string;
  description: string;
  timeline: string;
  location: string;
  venue?: string;
  year: number;
  status: 'planning' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
  implementationPartners: string[]; // Partner IDs
  sideEvents?: string[];
  documents: EventDocument[];
  workBreakdownStatus: {
    conceptNote: boolean;
    approvedBudget: boolean;
    eventPlanning: boolean;
    eventImplementation: boolean;
    reviewMeeting: boolean;
  };
  budget?: {
    total: number;
    allocated: number;
    spent: number;
    currency: string;
  };
  participants?: {
    invited: number;
    confirmed: number;
    attended: number;
  };
}

// Implementation Partners for SAYWHAT Flagship Events
export const implementationPartners: ImplementationPartner[] = [
  {
    id: "cyece",
    name: "Centre for Youth Empowerment and Civic Education",
    acronym: "CYECE",
    country: "Zimbabwe",
    focusAreas: ["Youth Empowerment", "Civic Education", "Community Development"],
    description: "Focuses on empowering young people through civic education and community engagement programs."
  },
  {
    id: "naqez",
    name: "National Action for Quality Education in Zambia",
    acronym: "NAQEZ",
    country: "Zambia",
    focusAreas: ["Quality Education", "Educational Advocacy", "Policy Development"],
    description: "Advocates for quality education and educational policy reform in Zambia."
  },
  {
    id: "mwana-pwo",
    name: "Associação Mwana Pwo",
    acronym: "Mwana Pwo",
    country: "Angola",
    focusAreas: ["Youth Development", "Community Programs", "Social Development"],
    description: "Angola-based organization focused on youth and community development initiatives."
  },
  {
    id: "gayo",
    name: "Girls Activist Youth Organization",
    acronym: "GAYO",
    country: "Regional",
    focusAreas: ["Girls Empowerment", "Youth Activism", "Gender Rights"],
    description: "Dedicated to empowering girls and promoting youth activism across the region."
  },
  {
    id: "muleide",
    name: "Associacao Mulher, Lei e Desenvolvimento",
    acronym: "MULEIDE",
    country: "Mozambique",
    focusAreas: ["Women's Rights", "Legal Aid", "Development"],
    description: "Mozambique-based organization focusing on women's rights, legal support, and development."
  },
  {
    id: "plataforma",
    name: "Plataforma Mulheres em Acção Angola",
    acronym: "PLATAFORMA",
    country: "Angola",
    focusAreas: ["Women's Empowerment", "Social Action", "Advocacy"],
    description: "Platform for women's action and empowerment in Angola."
  },
  {
    id: "mwanasikana-wanhasi-flagship",
    name: "Mwanasikana Wanhasi",
    acronym: "MWANASIKANA WANHASI",
    country: "Zimbabwe",
    focusAreas: ["Girls Empowerment", "Youth Development", "Education"],
    description: "Zimbabwe-based organization focused on empowering girls and young women."
  },
  {
    id: "crhe",
    name: "Centre for Reproductive Health and Education",
    acronym: "CRHE",
    country: "Regional",
    focusAreas: ["Reproductive Health", "Health Education", "Youth Health"],
    description: "Specialized in reproductive health education and services for young people."
  },
  {
    id: "facet",
    name: "Farming Communities Educational Trust",
    acronym: "FACET",
    country: "Zimbabwe",
    focusAreas: ["Agricultural Education", "Rural Development", "Community Trust"],
    description: "Educational trust focused on farming communities and agricultural development."
  }
];

// 2025 Flagship Events
export const flagshipEvents2025: FlagshipEvent[] = [
  {
    id: "agriculture-sports-gala-2025",
    name: "Agriculture Colleges Sports Gala",
    description: "An annual event uniting students from all agriculture colleges in Zimbabwe through sports, while fostering public health awareness & advocacy.",
    timeline: "7 – 10 April",
    location: "Bulawayo",
    venue: "Esigodini College of Agriculture",
    year: 2025,
    status: "planning",
    implementationPartners: ["cyece", "facet", "mwanasikana-wanhasi-flagship"],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  },
  {
    id: "quiz-challenge-2025",
    name: "SAYWHAT Quiz Challenge",
    description: "The competition highlights student's expertise in public health and education. Progressing to a televised championship where teams from universities in Zimbabwe compete in a 5-round challenge for the esteemed roving trophy, fostering informed advocacy and dialogue.",
    timeline: "10 – 11 July",
    location: "Nyazura",
    venue: "Studio of Choice, Rujeko",
    year: 2025,
    status: "planning",
    implementationPartners: ["cyece", "naqez", "crhe"],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  },
  {
    id: "sasi-debate-2025",
    name: "Speak and Solve Initiative (SASI) Debate Challenge",
    description: "This vibrant platform empowers students from universities in Zimbabwe to tackle health and education issues through British Parliamentary debates, culminating in a televised national championship that amplifies advocacy and skill-building.",
    timeline: "14 – 15 July",
    location: "Nyazura",
    venue: "Studio of Choice, Rujeko",
    year: 2025,
    status: "planning",
    implementationPartners: ["cyece", "naqez", "gayo"],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  },
  {
    id: "orathon-2025",
    name: "Orathon",
    description: "A signature advocacy event during the 16 Days of Activism with the Orange theme color, featuring a 16km run symbolizing unity against gender-based violence. Men and women run separate routes for 8km before merging to complete the race, highlighting solidarity and shared responsibility in addressing the issue as well as celebrating SAYWHAT anniversaries.",
    timeline: "29 Nov",
    location: "TBA",
    venue: "TBA",
    year: 2025,
    status: "planning",
    implementationPartners: ["gayo", "muleide", "plataforma", "mwanasikana-wanhasi-flagship"],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  },
  {
    id: "national-students-conference-2025",
    name: "National Students Conference",
    description: "In its 15th edition this year, this impactful event brings together students from 49 tertiary institutions in Zimbabwe, policymakers, researchers, and partners to tackle young people's health and education challenges.",
    timeline: "27 -29 Nov",
    location: "TBA",
    venue: "TBA",
    year: 2025,
    status: "planning",
    implementationPartners: ["cyece", "naqez", "crhe", "facet", "mwanasikana-wanhasi-flagship"],
    sideEvents: [
      "Forum of College Authorities on Students Sexual and reproductive health (FOCASS)",
      "Research Indaba",
      "Mugota/Ixhiba Young Men's Forum",
      "Web for Life Network Symposium",
      "SAYWHAT Awards"
    ],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  },
  {
    id: "craft-2025",
    name: "Creative Reproductive health Arts Festival for Transformation (CRAFT)",
    description: "This event spans a two-year implementation period, empowering Zimbabwean youth to address health and education challenges through artistic expression. Featuring competitions in music, drama, poetry, and public speaking, it offers mentorship opportunities and national platform performances.",
    timeline: "2025 – 2026",
    location: "TBA",
    venue: "TBA",
    year: 2025,
    status: "planning",
    implementationPartners: ["cyece", "crhe", "gayo", "mwanasikana-wanhasi-flagship"],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  },
  {
    id: "sarsyc-2026",
    name: "Southern African Regional Students and Youth Conference (SARSYC)",
    description: "A biennial forum hosted across SADC countries, this platform unites students, policymakers, researchers, and partners to address youth-related public health and education challenges.",
    timeline: "2026",
    location: "Namibia",
    venue: "TBA",
    year: 2026,
    status: "planning",
    implementationPartners: ["naqez", "mwana-pwo", "muleide", "plataforma", "crhe"],
    sideEvents: [
      "Research Indaba",
      "Mugota/Ixhiba Young Men's Forum",
      "Web for Life Network Symposium"
    ],
    documents: [],
    workBreakdownStatus: {
      conceptNote: false,
      approvedBudget: false,
      eventPlanning: false,
      eventImplementation: false,
      reviewMeeting: false
    },
    budget: {
      total: 0,
      allocated: 0,
      spent: 0,
      currency: "USD"
    },
    participants: {
      invited: 0,
      confirmed: 0,
      attended: 0
    }
  }
];

// Work Breakdown Structure Templates
export const workBreakdownStructure = [
  {
    phase: "conceptNote",
    name: "Concept Note Development",
    required: true,
    documents: ["Concept Note"]
  },
  {
    phase: "approvedBudget",
    name: "Approved Budget",
    required: true,
    documents: ["Budget Document", "Procurement Checklist"]
  },
  {
    phase: "eventPlanning",
    name: "Event Planning",
    required: true,
    documents: [
      "Participants Invitation Letters",
      "List of confirmed Participants & Details",
      "High Level Delegates Invitation Letters",
      "Content Development for speakers",
      "IEC Material Designs",
      "Media and Visibility Plan",
      "Editorial Policy",
      "Logistical Note",
      "Program Development"
    ]
  },
  {
    phase: "eventImplementation",
    name: "Event Implementation",
    required: true,
    documents: [
      "Registers & Consent Forms",
      "Evidence of Media Engagement",
      "Event Report",
      "Feedback Forms"
    ]
  },
  {
    phase: "reviewMeeting",
    name: "Review Meeting",
    required: true,
    documents: ["Minutes/Report"]
  }
];

// Helper functions
export const getEventsByYear = (year: number): FlagshipEvent[] => {
  return flagshipEvents2025.filter(event => event.year === year);
};

export const getEventsByStatus = (status: FlagshipEvent['status']): FlagshipEvent[] => {
  return flagshipEvents2025.filter(event => event.status === status);
};

export const getPartnersByCountry = (country: string): ImplementationPartner[] => {
  return implementationPartners.filter(partner => 
    partner.country.toLowerCase() === country.toLowerCase()
  );
};

export const getEventPartners = (eventId: string): ImplementationPartner[] => {
  const event = flagshipEvents2025.find(e => e.id === eventId);
  if (!event) return [];
  
  return implementationPartners.filter(partner => 
    event.implementationPartners.includes(partner.id)
  );
};

export const getEventProgress = (eventId: string): number => {
  const event = flagshipEvents2025.find(e => e.id === eventId);
  if (!event) return 0;
  
  const completedPhases = Object.values(event.workBreakdownStatus).filter(Boolean).length;
  const totalPhases = Object.keys(event.workBreakdownStatus).length;
  
  return (completedPhases / totalPhases) * 100;
};
