import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canUseCallCentre, listReferralOrganizations } from '@/lib/call-centre/referral-store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canUseCallCentre(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizations = await listReferralOrganizations({
      category: searchParams.get('category'),
      province: searchParams.get('province'),
      search: searchParams.get('search')
    });

    // Transform for dropdown usage - simplified format
    const dropdownData = organizations.map(org => ({
      id: org.id,
      name: org.name,
      label: org.name,
      value: org.name,
      category: org.categories[0], // Primary category
      province: org.province,
      focusAreas: org.focusAreas,
      contact: {
        phone: org.contact.phone[0], // Primary phone
        email: org.contact.email,
        address: org.contact.address
      }
    }));

    return NextResponse.json({
      success: true,
      organizations: dropdownData,
      total: dropdownData.length,
      // Also include full data if needed
      fullData: organizations
    });

  } catch (error) {
    console.error('Error fetching referral organizations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch referral organizations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
