import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    image?: string
    department: string
    position: string
    roles: string[]
    permissions: string[]
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      department: string
      position: string
      roles: string[]
      permissions: string[]
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    department: string
    position: string
    roles: string[]
    permissions: string[]
  }
}
