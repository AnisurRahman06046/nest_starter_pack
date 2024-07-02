import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from './constants/users.constant';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private userServices: UserService) {}

  @Roles(UserRoles.ADMIN)
  @Get('all-users')
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('deleted') deleted?: string,
  ) {
    // Convert deleted query parameter to boolean
    const filterDeleted =
      deleted === 'true' ? true : deleted === 'false' ? false : undefined;
    const result = await this.userServices.allUsers(
      page,
      limit,
      search,
      filterDeleted,
    );
    return {
      message: 'ALl users',
      success: 'true',
      statusCode: HttpStatus.FOUND,
      data: result,
    };
  }

  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @Get('user')
  async singleUser(@Request() req: any) {
    const id = req.user._id;
    // console.log(id)
    const result = await this.userServices.singleUser(id);
    return {
      message: 'Single user',
      success: 'true',
      statusCode: HttpStatus.FOUND,
      data: result,
    };
  }

  @Roles(UserRoles.ADMIN)
  @Patch('update/:id')
  async updateUserForAdmin(
    @Body() payload: UpdateUserDto,
    @Param('id') id: string,
  ) {
    const result = await this.userServices.updateUser(id, payload);
    return {
      message: 'User is updated',
      success: 'true',
      statusCode: HttpStatus.ACCEPTED,
      data: result,
    };
  }

  // update for user
  @Patch('update-profile')
  async updateProfile(@Body() payload: UpdateUserDto, @Request() req: any) {
    const id = req.user._id;
    const result = await this.userServices.updateUser(id, payload);
    return {
      message: 'User is updated',
      success: 'true',
      statusCode: HttpStatus.ACCEPTED,
      data: result,
    };
  }

  // delete a user (only admin)
  @Roles(UserRoles.ADMIN)
  @Delete('delete-user/:id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userServices.deleteUser(id);
    return {
      message: 'User is deleted',
      success: 'true',
      statusCode: HttpStatus.ACCEPTED,
      data: result,
    };
  }
}
