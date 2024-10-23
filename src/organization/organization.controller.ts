import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get()
  async getOrganization() {
    return await this.organizationService.getOrganization();
  }

  @Post()
  createRole(@Body() user: CreateUserDto) {
    user.role = user.role.toUpperCase();
    return this.organizationService.insertRole(user);
  }

  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.organizationService.getUserById(id);
  }

  @Get('role/:role')
  getUserByRole(@Param('role') role: string) {
    return this.organizationService.getUserByRole(role.toUpperCase());
  }
}
