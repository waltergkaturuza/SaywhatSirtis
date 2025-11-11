import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching program analytics...');

    // Get all projects
    const allProjects = await prisma.projects.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        objectives: true,
        country: true,
        province: true,
        priority: true
      }
    });

    console.log(`Found ${allProjects.length} projects in database`);

    // Status distribution (since there's no category field)
    const statusCount: Record<string, number> = {};
    allProjects.forEach(project => {
      const status = project.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const categoryDistribution = Object.entries(statusCount).map(([name, count]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: allProjects.length > 0 ? ((count / allProjects.length) * 100).toFixed(1) : 0
    })).sort((a, b) => b.count - a.count);

    // Generate status timeline for last 12 months
    const statusTimeline = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const monthProjects = allProjects.filter(p => {
        const projectDate = new Date(p.createdAt);
        return projectDate >= monthDate && projectDate < nextMonth;
      });

      // Count by status for projects created in this month or active during this month
      const activeInMonth = allProjects.filter(p => {
        const start = new Date(p.startDate);
        const end = p.endDate ? new Date(p.endDate) : new Date();
        return start <= nextMonth && end >= monthDate && 
               (p.status === 'ACTIVE' || p.status === 'IN_PROGRESS');
      }).length;

      const completedInMonth = allProjects.filter(p => {
        const end = p.endDate ? new Date(p.endDate) : null;
        return end && end >= monthDate && end < nextMonth && 
               (p.status === 'COMPLETED' || p.status === 'CLOSED');
      }).length;

      const pendingInMonth = allProjects.filter(p => {
        const start = new Date(p.startDate);
        return start >= monthDate && start < nextMonth && p.status === 'PENDING';
      }).length;

      statusTimeline.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
        active: activeInMonth,
        completed: completedInMonth,
        pending: pendingInMonth
      });
    }

    // Status counts
    const statusCounts = {
      active: allProjects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length,
      completed: allProjects.filter(p => p.status === 'COMPLETED' || p.status === 'CLOSED').length,
      pending: allProjects.filter(p => p.status === 'PENDING' || p.status === 'PLANNING').length,
      onHold: allProjects.filter(p => p.status === 'ON_HOLD' || p.status === 'SUSPENDED').length
    };

    // Calculate success rate (completed vs total)
    const successRate = allProjects.length > 0 
      ? ((statusCounts.completed / allProjects.length) * 100).toFixed(1)
      : 0;

    const response = {
      success: true,
      totalPrograms: allProjects.length,
      categoryDistribution,
      statusTimeline,
      statusCounts,
      successRate,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalStatuses: Object.keys(statusCount).length
      }
    };

    console.log('Returning program analytics:', {
      totalPrograms: response.totalPrograms,
      categoriesCount: response.categoryDistribution.length,
      timelineLength: response.statusTimeline.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching program analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program analytics' },
      { status: 500 }
    );
  }
}

