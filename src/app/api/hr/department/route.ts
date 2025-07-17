import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hr/department - Fetch all departments
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/hr/department - Create a new department
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Department name is required' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        description: description || null
      }
    });

    return NextResponse.json({
      success: true,
      data: department
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/hr/department - Update a department
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'Department ID and name are required' },
        { status: 400 }
      );
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        description: description || null
      }
    });

    return NextResponse.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/department - Delete a department
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
