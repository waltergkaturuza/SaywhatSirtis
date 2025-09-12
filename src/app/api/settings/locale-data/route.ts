import { NextRequest, NextResponse } from 'next/server';

// Comprehensive timezone data
const TIMEZONES = [
  // Africa
  { value: 'Africa/Abidjan', label: 'Africa/Abidjan (GMT)', offset: '+00:00', region: 'Africa' },
  { value: 'Africa/Accra', label: 'Africa/Accra (GMT)', offset: '+00:00', region: 'Africa' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)', offset: '+02:00', region: 'Africa' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (WET)', offset: '+00:00', region: 'Africa' },
  { value: 'Africa/Harare', label: 'Africa/Harare (CAT)', offset: '+02:00', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)', offset: '+02:00', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)', offset: '+01:00', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)', offset: '+03:00', region: 'Africa' },
  
  // Americas
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)', offset: '-05:00/-04:00', region: 'Americas' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)', offset: '-06:00/-05:00', region: 'Americas' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)', offset: '-07:00/-06:00', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)', offset: '-08:00/-07:00', region: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT)', offset: '-03:00', region: 'Americas' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)', offset: '-05:00/-04:00', region: 'Americas' },
  
  // Asia-Pacific
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT)', offset: '+07:00', region: 'Asia-Pacific' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)', offset: '+04:00', region: 'Asia-Pacific' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (HKT)', offset: '+08:00', region: 'Asia-Pacific' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)', offset: '+07:00', region: 'Asia-Pacific' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', offset: '+05:30', region: 'Asia-Pacific' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)', offset: '+08:00', region: 'Asia-Pacific' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)', offset: '+08:00', region: 'Asia-Pacific' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', offset: '+09:00', region: 'Asia-Pacific' },
  
  // Europe
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)', offset: '+01:00/+02:00', region: 'Europe' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)', offset: '+00:00/+01:00', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)', offset: '+01:00/+02:00', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)', offset: '+01:00/+02:00', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)', offset: '+01:00/+02:00', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich (CET/CEST)', offset: '+01:00/+02:00', region: 'Europe' },
  
  // Oceania
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)', offset: '+10:00/+11:00', region: 'Oceania' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)', offset: '+10:00/+11:00', region: 'Oceania' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)', offset: '+12:00/+13:00', region: 'Oceania' },
  
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00', region: 'UTC' }
];

// Comprehensive currency data
const CURRENCIES = [
  // Major Currencies
  { value: 'USD', label: 'US Dollar', symbol: '$', code: 'USD', region: 'Global' },
  { value: 'EUR', label: 'Euro', symbol: '€', code: 'EUR', region: 'Europe' },
  { value: 'GBP', label: 'British Pound Sterling', symbol: '£', code: 'GBP', region: 'Europe' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥', code: 'JPY', region: 'Asia-Pacific' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF', code: 'CHF', region: 'Europe' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$', code: 'CAD', region: 'Americas' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$', code: 'AUD', region: 'Oceania' },
  
  // African Currencies
  { value: 'NGN', label: 'Nigerian Naira', symbol: '₦', code: 'NGN', region: 'Africa' },
  { value: 'ZAR', label: 'South African Rand', symbol: 'R', code: 'ZAR', region: 'Africa' },
  { value: 'ZWL', label: 'Zimbabwean Dollar', symbol: 'Z$', code: 'ZWL', region: 'Africa' },
  { value: 'KES', label: 'Kenyan Shilling', symbol: 'KSh', code: 'KES', region: 'Africa' },
  { value: 'GHS', label: 'Ghanaian Cedi', symbol: '₵', code: 'GHS', region: 'Africa' },
  { value: 'EGP', label: 'Egyptian Pound', symbol: '£', code: 'EGP', region: 'Africa' },
  { value: 'MAD', label: 'Moroccan Dirham', symbol: 'د.م.', code: 'MAD', region: 'Africa' },
  { value: 'TND', label: 'Tunisian Dinar', symbol: 'د.ت', code: 'TND', region: 'Africa' },
  { value: 'ETB', label: 'Ethiopian Birr', symbol: 'Br', code: 'ETB', region: 'Africa' },
  
  // Asian Currencies
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥', code: 'CNY', region: 'Asia-Pacific' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹', code: 'INR', region: 'Asia-Pacific' },
  { value: 'KRW', label: 'South Korean Won', symbol: '₩', code: 'KRW', region: 'Asia-Pacific' },
  { value: 'SGD', label: 'Singapore Dollar', symbol: 'S$', code: 'SGD', region: 'Asia-Pacific' },
  { value: 'HKD', label: 'Hong Kong Dollar', symbol: 'HK$', code: 'HKD', region: 'Asia-Pacific' },
  { value: 'THB', label: 'Thai Baht', symbol: '฿', code: 'THB', region: 'Asia-Pacific' },
  { value: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM', code: 'MYR', region: 'Asia-Pacific' },
  { value: 'PHP', label: 'Philippine Peso', symbol: '₱', code: 'PHP', region: 'Asia-Pacific' },
  { value: 'IDR', label: 'Indonesian Rupiah', symbol: 'Rp', code: 'IDR', region: 'Asia-Pacific' },
  { value: 'VND', label: 'Vietnamese Dong', symbol: '₫', code: 'VND', region: 'Asia-Pacific' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ', code: 'AED', region: 'Asia-Pacific' },
  
  // Other Americas
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$', code: 'BRL', region: 'Americas' },
  { value: 'MXN', label: 'Mexican Peso', symbol: 'Mx$', code: 'MXN', region: 'Americas' },
  { value: 'ARS', label: 'Argentine Peso', symbol: '$', code: 'ARS', region: 'Americas' },
  { value: 'CLP', label: 'Chilean Peso', symbol: '$', code: 'CLP', region: 'Americas' },
  { value: 'COP', label: 'Colombian Peso', symbol: '$', code: 'COP', region: 'Americas' }
];

// Language data
const LANGUAGES = [
  { value: 'en', label: 'English', native: 'English', region: 'Global' },
  { value: 'es', label: 'Spanish', native: 'Español', region: 'Global' },
  { value: 'fr', label: 'French', native: 'Français', region: 'Global' },
  { value: 'pt', label: 'Portuguese', native: 'Português', region: 'Global' },
  { value: 'ar', label: 'Arabic', native: 'العربية', region: 'Middle East & North Africa' },
  
  // African Languages
  { value: 'ha', label: 'Hausa', native: 'Hausa', region: 'Africa' },
  { value: 'yo', label: 'Yoruba', native: 'Yorùbá', region: 'Africa' },
  { value: 'ig', label: 'Igbo', native: 'Igbo', region: 'Africa' },
  { value: 'sw', label: 'Swahili', native: 'Kiswahili', region: 'Africa' },
  { value: 'am', label: 'Amharic', native: 'አማርኛ', region: 'Africa' },
  { value: 'zu', label: 'Zulu', native: 'isiZulu', region: 'Africa' },
  { value: 'xh', label: 'Xhosa', native: 'isiXhosa', region: 'Africa' },
  { value: 'af', label: 'Afrikaans', native: 'Afrikaans', region: 'Africa' },
  
  // Other Major Languages
  { value: 'zh', label: 'Chinese (Simplified)', native: '中文', region: 'Asia-Pacific' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'Asia-Pacific' },
  { value: 'ja', label: 'Japanese', native: '日本語', region: 'Asia-Pacific' },
  { value: 'ko', label: 'Korean', native: '한국어', region: 'Asia-Pacific' },
  { value: 'de', label: 'German', native: 'Deutsch', region: 'Europe' },
  { value: 'it', label: 'Italian', native: 'Italiano', region: 'Europe' },
  { value: 'ru', label: 'Russian', native: 'Русский', region: 'Europe' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const region = searchParams.get('region');

    let data = {};

    switch (type) {
      case 'timezones':
        data = region ? 
          { timezones: TIMEZONES.filter(tz => tz.region === region) } : 
          { timezones: TIMEZONES };
        break;

      case 'currencies':
        data = region ? 
          { currencies: CURRENCIES.filter(cur => cur.region === region) } : 
          { currencies: CURRENCIES };
        break;

      case 'languages':
        data = region ? 
          { languages: LANGUAGES.filter(lang => lang.region === region) } : 
          { languages: LANGUAGES };
        break;

      default:
        // Return all data
        data = {
          timezones: TIMEZONES,
          currencies: CURRENCIES,
          languages: LANGUAGES,
          regions: ['Global', 'Africa', 'Americas', 'Asia-Pacific', 'Europe', 'Oceania', 'Middle East & North Africa']
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Locale data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locale data' },
      { status: 500 }
    );
  }
}
