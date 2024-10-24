import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  // Get whole organization structure
  @Get()
  async getOrganization() {
    return await this.organizationService.getOrganization();
  }

  // Insert New Role
  @Post()
  createRole(@Body() user: CreateUserDto) {
    user.role = user.role.toUpperCase();
    return this.organizationService.insertRole(user);
  }

  // Get User By ID
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.organizationService.getUserById(id);
  }

  // Get User By role
  @Get('role/:role')
  getUserByRole(@Param('role') role: string) {
    return this.organizationService.getUserByRole(role.toUpperCase());
  }

  // Update user info
  @Patch(':id')
  updateUserInfo(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.organizationService.updateUserInfo(id, user);
  }

  // Delete user Bty ID
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.organizationService.deleteUser(id);
  }

  // Get User Childrens By ID
  @Get('children/:id')
  getUserChildrens(@Param('id') id: string) {
    return this.organizationService.getUserChildren(id);
  }
}
