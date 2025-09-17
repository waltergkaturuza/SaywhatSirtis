import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all unique periods from performance reviews
    let periodsResult;
    try {
      periodsResult = await prisma.performance_reviews.findMany({
        select: {
          reviewDate: true,
          reviewType: true
        },
        distinct: ['reviewDate', 'reviewType'],
        orderBy: {
          reviewDate: 'desc'
        }
      });
    } catch (dbError: any) {
      console.error('Database connection failed for periods:', dbError?.message || 'Unknown error');
      
      // Return empty periods array when database is unavailable
      periodsResult = [];
    }

    // Generate period options from the database results
    const periods = periodsResult.map(review => {
      const date = new Date(review.reviewDate);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      
      if (review.reviewType === 'annual') {
        return {
          value: `Annual-${year}`,
          label: `Annual ${year}`,
          date: review.reviewDate
        };
      } else if (review.reviewType === 'quarterly') {
        return {
          value: `Q${quarter}-${year}`,
          label: `Q${quarter} ${year}`,
          date: review.reviewDate
        };
      } else {
        // For other review types, use month-year format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        return {
          value: `${month}-${year}`,
          label: `${month} ${year}`,
          date: review.reviewDate
        };
      }
    });

    // Remove duplicates and sort by date
    const uniquePeriods = periods.filter((period, index, self) => 
      index === self.findIndex(p => p.value === period.value)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // If no periods exist in database, provide current and recent periods
    if (uniquePeriods.length === 0) {
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
      
      const defaultPeriods = [];
      // Add current and past 3 years of quarters and annual reviews
      for (let year = currentYear; year >= currentYear - 3; year--) {
        defaultPeriods.push({
          value: `Annual-${year}`,
          label: `Annual ${year}`,
          date: new Date(year, 11, 31) // Dec 31 of the year
        });
        
        for (let q = 4; q >= 1; q--) {
          if (year === currentYear && q > currentQuarter) continue;
          defaultPeriods.push({
            value: `Q${q}-${year}`,
            label: `Q${q} ${year}`,
            date: new Date(year, (q * 3) - 1, 1) // First month of quarter
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        data: defaultPeriods.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        message: 'Default periods generated (no reviews found in database)'
      });
    }

    return NextResponse.json({
      success: true,
      data: uniquePeriods,
      message: 'Performance review periods fetched successfully'
    });

  } catch (error) {
    console.error('Failed to fetch periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch periods' },
      { status: 500 }
    );
  }
}