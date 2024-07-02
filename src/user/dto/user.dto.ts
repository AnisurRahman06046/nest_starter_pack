import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { UserRoles } from '../constants/users.constant';
import { PartialType } from '@nestjs/mapped-types';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  hashedPassword: string;

  @IsEnum(UserRoles)
  role: UserRoles;

  @IsBoolean()
  isDeleted: boolean = false;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
