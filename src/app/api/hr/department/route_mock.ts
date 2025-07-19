import { NextRequest, NextResponse } from 'next/server';

// Mock data for departments - in production, use your actual database
const departments = [
  {
    id: '1',
    name: 'Human Resources',
    description: 'Manages employee relations, recruitment, and policies',
    employeeCount: 12,
    manager: 'Sarah Johnson',
    budget: 500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Information Technology',
    description: 'Manages technology infrastructure and systems',
    employeeCount: 25,
    manager: 'Michael Chen',
    budget: 1200000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Finance',
    description: 'Handles financial planning, budgeting, and accounting',
    employeeCount: 8,
    manager: 'Emily Rodriguez',
    budget: 300000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Operations',
    description: 'Oversees daily operations and logistics',
    employeeCount: 45,
    manager: 'David Thompson',
    budget: 800000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let nextId = 5;

export async function GET() {
  try {
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if department with same name already exists
    const existingDept = departments.find(dept => 
      dept.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingDept) {
      return NextResponse.json({ error: 'Department with this name already exists' }, { status: 400 });
    }

    const newDepartment = {
      id: nextId.toString(),
      name,
      description: description || '',
      employeeCount: 0,
      manager: '',
      budget: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    departments.push(newDepartment);
    nextId++;

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
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

    const departmentIndex = departments.findIndex(dept => dept.id === id);
    
    if (departmentIndex === -1) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if department has employees
    const department = departments[departmentIndex];
    if (department.employeeCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with assigned employees' },
        { status: 400 }
      );
    }

    departments.splice(departmentIndex, 1);

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
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

    const departmentIndex = departments.findIndex(dept => dept.id === id);
    
    if (departmentIndex === -1) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if another department with same name exists
    const existingDept = departments.find(dept => 
      dept.id !== id && dept.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingDept) {
      return NextResponse.json({ error: 'Department with this name already exists' }, { status: 400 });
    }

    const updatedDepartment = {
      ...departments[departmentIndex],
      name,
      description: description || departments[departmentIndex].description,
      updatedAt: new Date().toISOString(),
    };

    departments[departmentIndex] = updatedDepartment;

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}
