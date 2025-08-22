// SAYWHAT Call Centre Referral Directory
// This contains partner organizations that can provide specialized support

export interface ReferralOrganization {
  id: string;
  name: string;
  focusAreas: string[];
  description: string;
  contact: {
    address?: string;
    phone: string[];
    email?: string;
    website?: string;
  };
  categories: string[];
  province?: string;
  city?: string;
}

export const referralDirectory: ReferralOrganization[] = [
  {
    id: "saywhat",
    name: "Students and Youth Working on Reproductive Health Action Team (SAYWHAT)",
    focusAreas: ["Youth", "Reproductive Health"],
    description: "Focus areas – youth, reproductive health",
    contact: {
      address: "24 Jefferson Road, Logan Park, Hatfield, Harare",
      phone: ["+263 242 571184", "+263 242 571190", "+263 772 146 247", "+263 772 146 249", "+263 782 702 886"]
    },
    categories: ["Youth Empowerment", "Reproductive Health", "Education"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "institute-young-women",
    name: "Institute for Young Women's Development",
    focusAreas: ["Girls Rights", "Young Women's Rights"],
    description: "Focus areas – girls and young women's rights",
    contact: {
      address: "570 Hay Street, Bindura",
      phone: ["+263 785 651 276", "+263 718 290 301"],
      email: "info@youngwomeninstitute.net"
    },
    categories: ["Women's Rights", "Girls Empowerment", "Youth Development"],
    province: "Mashonaland Central",
    city: "Bindura"
  },
  {
    id: "youth-advocates-zim",
    name: "Youth Advocates Zimbabwe",
    focusAreas: ["Advocacy", "Skills Training", "Child Rights", "Human Rights Education"],
    description: "Focus areas – advocacy, skills training, child and human rights education, referral services for young women and girls",
    contact: {
      address: "PO Box 502 Chitungwiza",
      phone: ["+263 774 800 552", "+263 777 469 107", "+263 242 772 105"]
    },
    categories: ["Advocacy", "Skills Training", "Child Protection", "Human Rights"],
    province: "Harare",
    city: "Chitungwiza"
  },
  {
    id: "ignite-youth",
    name: "Ignite Youth",
    focusAreas: ["Skills Training", "Career Coaching", "Mental Health", "Girls Empowerment"],
    description: "Focus areas – skills training, career coaching, building emotional and mental health, girls empowerment",
    contact: {
      address: "Avondale, Harare",
      phone: ["+263 787 360 337", "+263 772 418 652"],
      email: "info@igniteyouth.co.zw"
    },
    categories: ["Skills Training", "Mental Health", "Career Development", "Girls Empowerment"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "young-womens-forum",
    name: "Young Women's Forum for Good Governance",
    focusAreas: ["Child Rights", "Youth Rights", "Peace and Security"],
    description: "Focus areas – child and youth rights, peace and security",
    contact: {
      address: "134 Herbert Chitepo, Mutare",
      phone: ["+263 776 778 368"],
      email: "mchogugudza@gmail.com"
    },
    categories: ["Good Governance", "Child Rights", "Youth Rights", "Peace Building"],
    province: "Manicaland",
    city: "Mutare"
  },
  {
    id: "youth-alive",
    name: "Youth Alive",
    focusAreas: ["Peace Promotion", "Educational Interventions"],
    description: "Focus areas – promoting peace through educational interventions in communities",
    contact: {
      address: "27, 10th Avenue, Mutare",
      phone: ["+263 20 62530"],
      email: "youthalive@youthalive.org.zw"
    },
    categories: ["Peace Building", "Education", "Community Development"],
    province: "Manicaland",
    city: "Mutare"
  },
  {
    id: "youth-peace-development",
    name: "Youth for Peace and Development",
    focusAreas: ["Conflict Prevention", "Youth Development", "Peace Education", "Human Rights", "Dialogue", "Mediation"],
    description: "Focus areas– conflict prevention, youth development, peace education, human rights, dialogue and mediation",
    contact: {
      address: "58 Greendale Avenue, Greendale, Harare",
      phone: ["+263 715 793 814", "+263 782 049 797"],
      email: "y4pd.zim@gmail.com"
    },
    categories: ["Peace Building", "Conflict Resolution", "Human Rights", "Youth Development"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "yett",
    name: "Youth Empowerment and Transformation Trust (YETT)",
    focusAreas: ["Conflict Prevention", "Early Warning", "Peace Education", "Transitional Justice", "Reconciliation"],
    description: "Focus areas– conflict prevention and early warning, peace education, transitional justice and reconciliation",
    contact: {
      address: "7 Capri Road, Highlands, Harare",
      phone: ["+263 242 496 889"]
    },
    categories: ["Peace Building", "Conflict Prevention", "Transitional Justice", "Youth Empowerment"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "yeso",
    name: "Youth Empowerment Satellite Organisation (YESO)",
    focusAreas: ["Youth Empowerment"],
    description: "Focus area– youth empowerment",
    contact: {
      address: "PO Box 561 Nyika Masvingo",
      phone: ["+263 773 548 894"],
      email: "yeso232012@gmail.com"
    },
    categories: ["Youth Empowerment", "Community Development"],
    province: "Masvingo",
    city: "Masvingo"
  },
  {
    id: "mwanasikana-wanhasi",
    name: "Mwanasikana Wanhasi",
    focusAreas: ["Girls Empowerment"],
    description: "Focus areas– Girls empowerment",
    contact: {
      address: "2 Brenschin Drive, Marlborough, Harare",
      phone: ["+263 774 666 401"],
      email: "annesleyndondo7@gmail.com"
    },
    categories: ["Girls Empowerment", "Women's Rights"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "tag-a-life",
    name: "Tag a Life International (TaLI)",
    focusAreas: ["Girls Rights", "Young Women's Rights", "Education", "Peace", "Gender Based Violence", "Sexual Reproductive Health"],
    description: "Focus areas– girls and young women's rights, education, peace, gender based violence, sexual reproductive health rights",
    contact: {
      address: "52 Glamorgan Road, Belvedere, Harare",
      phone: ["+263 242 782 264"]
    },
    categories: ["GBV Support", "Sexual Health", "Girls Empowerment", "Education"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "nayo",
    name: "National Association of Youth Organisations",
    focusAreas: ["Youth Organization Coordination"],
    description: "Focus areas– umbrella body of youth organisations working in Zimbabwe",
    contact: {
      phone: ["+263 8644 121 604"],
      email: "info@nayoafrica.org"
    },
    categories: ["Youth Coordination", "Networking", "Capacity Building"],
    province: "National",
    city: "Various"
  },
  {
    id: "restless-development",
    name: "Restless Development",
    focusAreas: ["Youth Leadership"],
    description: "Focus areas– supporting young people to be leaders",
    contact: {
      address: "1 Adyllin, Marlborough, Harare",
      phone: ["+263 242 300 811", "+263 242 300 819"],
      email: "infozimbabwe@restlessdevelopment.org"
    },
    categories: ["Leadership Development", "Youth Empowerment", "Capacity Building"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "dot-youth",
    name: "Dot Youth",
    focusAreas: ["Youth Empowerment", "Health Promotion"],
    description: "Focus areas– youth empowerment, health promotion",
    contact: {
      address: "Mzilikazi Youth Centre, Bulawayo",
      phone: ["+263 773 380 694"],
      website: "www.dotyouth.org.zw"
    },
    categories: ["Youth Empowerment", "Health Promotion", "Community Development"],
    province: "Bulawayo",
    city: "Bulawayo"
  },
  {
    id: "yidez",
    name: "Youth Initiative for Democracy in Zimbabwe (YIDEZ)",
    focusAreas: ["Youth Empowerment", "Conflict Prevention"],
    description: "Focus areas– youth empowerment, conflict prevention",
    contact: {
      address: "6 Armagh Rd, Eastlea, Harare",
      phone: []
    },
    categories: ["Democracy", "Youth Empowerment", "Conflict Prevention"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "education-matters",
    name: "Education Matters",
    focusAreas: ["Youth Education", "Career Opportunities"],
    description: "Focus areas– youth education and career opportunities",
    contact: {
      address: "23 Connaught Rd, Avondale",
      phone: ["+263 8677 111 889"],
      email: "info@edmattersafrica.org"
    },
    categories: ["Education", "Career Development", "Skills Training"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "young-peoples-programme",
    name: "Young People's Programme Zimbabwe",
    focusAreas: ["Young People's Empowerment"],
    description: "Focus areas– young people's empowerment",
    contact: {
      address: "66 Jason Moyo Ave, Harare",
      phone: ["+263 774 099 571"]
    },
    categories: ["Youth Empowerment", "Community Development"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "rncypt",
    name: "Regional Network of Children and Young People Trust",
    focusAreas: ["Sexual and Reproductive Health", "Girls Empowerment", "Youth Participation"],
    description: "Focus areas– sexual and reproductive health rights, girls and young women's empowerment, child and youth participation in governance",
    contact: {
      address: "3 Ifield Road, Mabelreign, Harare",
      phone: ["+263 242 331 630", "+263 8677 106 728"],
      email: "info@rncypt.org"
    },
    categories: ["Sexual Health", "Girls Empowerment", "Youth Participation", "Governance"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "youth-for-life",
    name: "Youth for Life Zimbabwe Trust",
    focusAreas: ["Sexual and Reproductive Health", "Child Marriage Prevention"],
    description: "Focus areas- sexual and reproductive health rights, ending child marriages",
    contact: {
      address: "1 Torwood Community Hall, Redcliff",
      phone: ["+263 776 799 169"],
      email: "info@youthforlifezimbabwetrust.org"
    },
    categories: ["Sexual Health", "Child Protection", "Marriage Prevention"],
    province: "Midlands",
    city: "Redcliff"
  },
  {
    id: "youth-engage",
    name: "Youth Engage",
    focusAreas: ["Youth Advocacy"],
    description: "Focus areas – youth advocacy",
    contact: {
      address: "30 St Patricks Road, Hatfield, Harare",
      phone: ["+263 772 327 027"],
      email: "youthengage8@gmail.com"
    },
    categories: ["Advocacy", "Youth Empowerment"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "simuka-africa",
    name: "Simuka Africa",
    focusAreas: ["Youth Empowerment", "Child Marriage Prevention"],
    description: "Focus areas – youth empowerment, ending child marriages",
    contact: {
      address: "3974 Ngoni Township Norton",
      phone: ["+263 772 419 312"],
      email: "info@simukaafrica.org.zw"
    },
    categories: ["Youth Empowerment", "Child Protection", "Marriage Prevention"],
    province: "Mashonaland West",
    city: "Norton"
  },
  {
    id: "hope-adolescents-youth",
    name: "Hope for Adolescents and Youth",
    focusAreas: ["Youth Empowerment"],
    description: "Focus areas – youth empowerment",
    contact: {
      address: "618 New Adyllin, Westgate, Harare",
      phone: ["+263 242 313 293"]
    },
    categories: ["Youth Empowerment", "Adolescent Support"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "child-youth-care",
    name: "Child and Youth Care Zimbabwe",
    focusAreas: ["Health", "Rare Diseases"],
    description: "Focus – health, children and youth with rare diseases",
    contact: {
      address: "3 Sable Street, Mandara, Harare",
      phone: ["+263 777 510 370"],
      email: "info@cyc.org.zw"
    },
    categories: ["Health Care", "Special Needs", "Child Care"],
    province: "Harare",
    city: "Harare"
  },
  {
    id: "my-age",
    name: "My Age",
    focusAreas: ["Girls Empowerment", "Young Women's Empowerment"],
    description: "Focus areas – empowering girls and young women's",
    contact: {
      address: "7 Capri Rd Highlands, Harare; 15 Flametree Road, Rhodene, Masvingo",
      phone: ["+263 39 226 1452"],
      email: "info@myage-zim.org"
    },
    categories: ["Girls Empowerment", "Women's Rights"],
    province: "Multiple",
    city: "Harare, Masvingo"
  }
];

// Helper functions for filtering and searching
export const getOrganizationsByCategory = (category: string): ReferralOrganization[] => {
  return referralDirectory.filter(org => 
    org.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
  );
};

export const getOrganizationsByProvince = (province: string): ReferralOrganization[] => {
  return referralDirectory.filter(org => 
    org.province?.toLowerCase() === province.toLowerCase()
  );
};

export const searchOrganizations = (query: string): ReferralOrganization[] => {
  const lowercaseQuery = query.toLowerCase();
  return referralDirectory.filter(org => 
    org.name.toLowerCase().includes(lowercaseQuery) ||
    org.focusAreas.some(area => area.toLowerCase().includes(lowercaseQuery)) ||
    org.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery)) ||
    org.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const getUniqueCategories = (): string[] => {
  const allCategories = referralDirectory.flatMap(org => org.categories);
  return [...new Set(allCategories)].sort();
};

export const getUniqueProvinces = (): string[] => {
  const allProvinces = referralDirectory.map(org => org.province).filter(Boolean) as string[];
  return [...new Set(allProvinces)].sort();
};
