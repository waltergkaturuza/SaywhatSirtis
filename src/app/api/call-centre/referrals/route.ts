import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { referralDirectory, type ReferralOrganization } from '@/data/referral-directory';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - allow call centre access
    const hasPermission = session.user.permissions?.includes('calls.view') ||
      session.user.permissions?.includes('calls.full_access') ||
      session.user.permissions?.includes('callcentre.access') ||
      session.user.roles?.includes('admin') ||
      session.user.roles?.includes('manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const province = searchParams.get('province');
    const search = searchParams.get('search');

    let organizations = referralDirectory;

    // Apply filters if provided
    if (category && category !== 'all') {
      organizations = organizations.filter(org => 
        org.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
      );
    }

    if (province && province !== 'all') {
      organizations = organizations.filter(org => 
        org.province?.toLowerCase() === province.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      organizations = organizations.filter(org => 
        org.name.toLowerCase().includes(searchLower) ||
        org.focusAreas.some(area => area.toLowerCase().includes(searchLower)) ||
        org.categories.some(cat => cat.toLowerCase().includes(searchLower)) ||
        org.description.toLowerCase().includes(searchLower)
      );
    }

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