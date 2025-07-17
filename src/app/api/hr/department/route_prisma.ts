import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const department = await prisma.department.create({
      data: { name, description },
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    // Check if department has employees before deletion
    // const employeeCount = await prisma.employee.count({
    //   where: { departmentId: id },
    // });

    // if (employeeCount > 0) {
    //   return NextResponse.json(
    //     { error: 'Cannot delete department with assigned employees' },
    //     { status: 400 }
    //   );
    // }

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { name, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const department = await prisma.department.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}
