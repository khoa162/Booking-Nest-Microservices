import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { User, UserDocument } from '../user/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async signup(dto: CreateUserDto) {
    try {
      const existing = await this.userModel.findOne({ email: dto.email });
      if (existing) throw new ConflictException('Email already in use');

      const hashed = await bcrypt.hash(dto.password, 10);
      const user = new this.userModel({
        email: dto.email,
        password_hash: hashed,
        name: dto.name,
      });

      await user.save();
      return { msg: 'Signup successful' };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Signup failed');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.userModel.findOne({ email: dto.email });
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const match = await bcrypt.compare(dto.password, user.password_hash);
      if (!match) throw new UnauthorizedException('Invalid credentials');

      const payload = { sub: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

      return { access_token: token };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Login failed');
    }
  }
}