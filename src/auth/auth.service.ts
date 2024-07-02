import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import { CreateUserDto } from 'src/user/dto/user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  //   sign up
  async registerUser(payload: CreateUserDto) {
    const isUserExist = await this.userModel.findOne({ email: payload.email });
    if (isUserExist)
      throw new HttpException('User is already exist', HttpStatus.BAD_REQUEST);
    const user = await this.userModel.create(payload);
    if (!user)
      throw new HttpException('Failed to create', HttpStatus.BAD_REQUEST);
    // Exclude the password from the returned document
    const userWithoutPassword = await this.userModel
      .findById(user._id)
      .select('-hashedPassword')
      .exec();

    return userWithoutPassword;
  }

  // sign in
  async login(payload: { email: string; hashedPassword: string }) {
    const user = await this.userModel.findOne({ email: payload.email });
    const isMatch = await bcrypt.compare(
      payload.hashedPassword,
      user.hashedPassword,
    );
    console.log(payload.hashedPassword);
    console.log(isMatch);
    if (!isMatch) throw new UnauthorizedException();

    const tokenPayload = { _id: user._id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(tokenPayload);
    return { access_token: token };
  }
}
