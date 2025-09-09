/**
 * Utility functions for generating case numbers and call codes
 */

/**
 * Generate a proper case number in format: CASE-YEAR-MONTH-DAY-XXXXXX
 * @returns {Promise<string>} Formatted case number
 */
export async function generateCaseNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Get count of cases created today to generate sequential number
  const today = new Date(year, now.getMonth(), now.getDate());
  const tomorrow = new Date(year, now.getMonth(), now.getDate() + 1);
  
  const prefix = `CASE-${year}-${month}-${day}`;
  
  // For now, generate a random 6-digit number
  // In production, you might want to query the database for the last number used today
  const sequentialNumber = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
  
  return `${prefix}-${sequentialNumber}`;
}

/**
 * Generate a proper call code in format: CALL-YEAR-MONTH-DAY-XXXXXX
 * @returns {Promise<string>} Formatted call code
 */
export async function generateCallCode(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Generate sequential number
  const sequentialNumber = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
  
  return `CALL-${year}-${month}-${day}-${sequentialNumber}`;
}

/**
 * Generate a proper case number with database check for uniqueness
 * @param {any} prisma - Prisma client instance
 * @returns {Promise<string>} Unique case number
 */
export async function generateUniqueCaseNumber(prisma: any): Promise<string> {
  let caseNumber: string;
  let exists = true;
  
  while (exists) {
    caseNumber = await generateCaseNumber();
    const existingCase = await prisma.callRecord.findFirst({
      where: { caseNumber }
    });
    exists = !!existingCase;
  }
  
  return caseNumber!;
}

/**
 * Get provinces list for Zimbabwe
 */
export const zimbabweProvinces = [
  'Harare',
  'Bulawayo', 
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands'
];

/**
 * Get districts by province (sample data - expand as needed)
 */
export const districtsByProvince: Record<string, string[]> = {
  'Harare': ['Harare Urban', 'Chitungwiza', 'Epworth', 'Ruwa'],
  'Bulawayo': ['Bulawayo Urban'],
  'Manicaland': ['Mutare', 'Rusape', 'Chipinge', 'Chimanimani', 'Makoni', 'Nyanga', 'Buhera'],
  'Mashonaland Central': ['Bindura', 'Guruve', 'Mazowe', 'Rushinga', 'Shamva'],
  'Mashonaland East': ['Chitungwiza', 'Goromonzi', 'Marondera', 'Mudzi', 'Murehwa', 'Mutoko', 'Seke', 'UMP'],
  'Mashonaland West': ['Chinhoyi', 'Hurungwe', 'Kadoma', 'Kariba', 'Makonde', 'Norton', 'Zvimba'],
  'Masvingo': ['Masvingo Urban', 'Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Masvingo Rural', 'Zaka'],
  'Matabeleland North': ['Binga', 'Bubi', 'Hwange', 'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza'],
  'Matabeleland South': ['Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Matobo', 'Umzingwane'],
  'Midlands': ['Gweru', 'Kwekwe', 'Redcliff', 'Chirumhanzu', 'Gokwe North', 'Gokwe South', 'Lalapansi', 'Mberengwa', 'Shurugwi', 'Zvishavane']
};

/**
 * Validate Zimbabwe phone number
 */
export function validateZimbabwePhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check if it starts with +263, 263, or 0 followed by 7 digits
  const patterns = [
    /^\+2637\d{8}$/,  // +2637xxxxxxxx
    /^2637\d{8}$/,    // 2637xxxxxxxx  
    /^07\d{8}$/       // 07xxxxxxxx
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Format Zimbabwe phone number to standard format
 */
export function formatZimbabwePhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (cleanPhone.startsWith('+263')) {
    return cleanPhone;
  } else if (cleanPhone.startsWith('263')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('07')) {
    return `+263${cleanPhone.substring(1)}`;
  }
  
  return phone; // Return original if no match
}
