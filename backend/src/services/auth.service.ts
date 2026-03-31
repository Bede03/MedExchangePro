import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, isValidEmail } from '../utils/auth';
import { generateToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      token,
    };
  }

  async signup(
    fullName: string,
    email: string,
    password: string,
    role: string,
    hospitalId: string
  ) {
    email = email.toLowerCase().trim();

    if (!isValidEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Verify hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      throw new AppError(404, 'Hospital not found');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: role as any,
        hospitalId,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      token,
    };
  }

  async validateToken(token: string) {
    const user = await prisma.user.findUnique({
      where: { id: (token as any).id },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    return user;
  }
}

export const authService = new AuthService();
