import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

export class UserService {
  async createUser(data: any) {
    // Validate required fields
    if (!data.fullName || !data.email || !data.password || !data.role || !data.hospitalId) {
      throw new AppError(400, 'Missing required fields: fullName, email, password, role, hospitalId');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const createData: any = {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      hospitalId: data.hospitalId,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : false,
    };

    const user = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        hospitalId: true,
        createdAt: true,
        isActive: true,
      },
    });

    return user;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        hospitalId: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDeleted: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async getUsersByHospital(hospitalId: string) {
    return await prisma.user.findMany({
      where: { hospitalId, isDeleted: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        hospitalId: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    console.log('🔍 DEBUG updateUser called with:', { id, dataKeys: Object.keys(data), data });

    const updateData: any = {};

    if (data.fullName !== undefined && data.fullName !== null && data.fullName.trim()) {
      updateData.fullName = data.fullName;
      console.log('✅ Setting fullName:', data.fullName);
    }

    if (data.email !== undefined && data.email !== null && data.email.trim()) {
      updateData.email = data.email;
      console.log('✅ Setting email:', data.email);
    }

    if (data.role !== undefined && data.role !== null) {
      updateData.role = data.role;
      console.log('✅ Setting role:', data.role);
    }

    if (typeof data.isActive === 'boolean') {
      updateData.isActive = data.isActive;
      console.log('✅ Setting isActive:', data.isActive);
    }

    if (data.password !== undefined && data.password !== null && data.password.trim()) {
      console.log('🔐 Password provided, hashing...');
      const hashedPassword = await hashPassword(data.password);
      updateData.password = hashedPassword;
      console.log('✅ Password hashed and set');
    } else {
      console.log('❌ No password in data or password is empty');
    }

    if (Object.keys(updateData).length === 0) {
      console.log('❌ No fields to update!');
      throw new AppError(400, 'No fields to update');
    }

    console.log('📝 Final updateData:', { updateKeys: Object.keys(updateData) });

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        hospitalId: true,
        updatedAt: true,
        isActive: true,
      },
    });

    return user;
  }

  async deleteUser(id: string) {
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  async getAllUsers(currentUser: JwtPayload) {
    return await prisma.user.findMany({
      where: {
        hospitalId: currentUser.hospitalId,
        isDeleted: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        hospitalId: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });
  }
}

export const userService = new UserService();
