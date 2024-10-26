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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrganizationDto } from './dto/organization.dto';

@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  // Get whole organization structure
  @Get()
  @ApiOperation({ summary: 'Returns the whole organization structure' })
  @ApiOkResponse({
    description: 'List the organization successfully',
    type: OrganizationDto,
  })
  async getOrganization() {
    return await this.organizationService.getOrganization();
  }

  // Insert New Role
  @Post()
  @ApiOperation({ summary: 'Create a new user in the organization' })
  @ApiCreatedResponse({
    description: 'Returns 201 created after inserting the new user',
    type: OrganizationDto,
  })
  @ApiBadRequestResponse({
    description: 'When user wants to be a ceo and there already is one.',
  })
  @ApiBadRequestResponse({
    description: 'When user doesnt report to any role.',
  })
  createRole(@Body() user: CreateUserDto) {
    user.role = user.role.toUpperCase();
    return this.organizationService.insertRole(user);
  }

  // Get User By ID
  @Get('/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'Unique Identifier of the user' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: OrganizationDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return this.organizationService.getUserById(id);
  }

  // Get User By role
  @Get('role/:role')
  @ApiOperation({ summary: 'Get user by role' })
  @ApiParam({ name: 'role', description: 'Role of the user' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: OrganizationDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserByRole(@Param('role') role: string) {
    return this.organizationService.getUserByRole(role.toUpperCase());
  }

  // Update user info
  @Patch(':id')
  @ApiOperation({ summary: 'Update user info' })
  @ApiParam({ name: 'id', description: 'Unique Identifier of the user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: OrganizationDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserInfo(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.organizationService.updateUserInfo(id, user);
  }

  // Delete user By ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'Unique Identifier of the user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param('id') id: string) {
    return this.organizationService.deleteUser(id);
  }

  // Get User Childrens By ID
  @Get('children/:id')
  @ApiOperation({ summary: 'Get user children by ID' })
  @ApiParam({ name: 'id', description: 'Unique Identifier of the user' })
  @ApiResponse({
    status: 200,
    description: 'Children found',
    type: [OrganizationDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserChildrens(@Param('id') id: string) {
    return this.organizationService.getUserChildren(id);
  }
}
