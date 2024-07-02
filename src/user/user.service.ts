import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async allUsers(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    filterDeleted?: boolean,
  ) {
    const query: any = {};

    // Search by name or email
    // Adjusted regex for search by name or email
    if (search) {
      const searchRegex = search
        .split(/\s+/)
        .map((term) => `(?=.*${term})`)
        .join('');
      const regex = new RegExp(`^${searchRegex}.*$`, 'i');

      query.$or = [{ name: { $regex: regex } }, { email: { $regex: regex } }];
    }

    // Filter by deleted status
    if (typeof filterDeleted === 'boolean') {
      query.isDeleted = filterDeleted;
    }

    // Calculate total number of users
    const totalUsers = await this.userModel.countDocuments(query);

    // Pagination and user retrieval
    const users = await this.userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-hashedPassword') // Exclude the password field
      .exec();

    if (users.length === 0)
      throw new HttpException('No users available', HttpStatus.NOT_FOUND);

    return {
      totalUsers,
      users,
      page,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  // get single user
  async singleUser(id: string) {
    const user = await this.userModel
      .findOne({ _id: id })
      .select('-hashedPassword');
    if (!user)
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
    return user;
  }

  // update user
  async updateUser(id: string, payload: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: id });
    if (!user)
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
    const result = await this.userModel
      .updateOne(
        {
          _id: id,
          isDeleted: false,
        },
        payload,
        { new: true },
      )
      .select('-hashedPassword');
    return result;
  }

  // delete user
  async deleteUser(id: string) {
    const user = await this.userModel.findOne({ _id: id, isDeleted: false });
    if (!user)
      return new HttpException('User is not found', HttpStatus.NOT_FOUND);
    const result = await this.userModel.updateOne(
      { _id: id },
      { isDeleted: true },
    );
    return result;
  }
}
