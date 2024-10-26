import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationDto } from './dto/organization.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OrganizationService } from './organization.service';
import { OrganizationEntity } from 'src/entities/organization.entity';
import { Repository } from 'typeorm';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: OrganizationService;
  let repository: Repository<OrganizationEntity>;

  const mockOrganizationService = {
    getOrganization: jest.fn(() => Promise.resolve([new OrganizationDto()])),
    insertRole: jest.fn((user: CreateUserDto) =>
      Promise.resolve(new OrganizationDto()),
    ),
    getUserById: jest.fn((id: string) =>
      Promise.resolve(new OrganizationDto()),
    ),
    getUserByRole: jest.fn((role: string) =>
      Promise.resolve(new OrganizationDto()),
    ),
    updateUserInfo: jest.fn((id: string, user: UpdateUserDto) =>
      Promise.resolve(new OrganizationDto()),
    ),
    deleteUser: jest.fn((id: string) => Promise.resolve()),
    getUserChildren: jest.fn((id: string) =>
      Promise.resolve([new OrganizationDto()]),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        { provide: OrganizationService, useValue: mockOrganizationService },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the whole organization structure', async () => {
    const result = await controller.getOrganization();
    expect(result).toEqual([new OrganizationDto()]);
    expect(service.getOrganization).toHaveBeenCalled();
  });

  it('should create a new role', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      description: 'CEO',
      role: 'ceo',
    };
    const result = await controller.createRole(createUserDto);
    expect(result).toEqual(new OrganizationDto());
    expect(service.insertRole).toHaveBeenCalledWith(createUserDto);
  });

  it('should get user by ID', async () => {
    const result = await controller.getUserById('1');
    expect(result).toEqual(new OrganizationDto());
    expect(service.getUserById).toHaveBeenCalledWith('1');
  });

  it('should get user by role', async () => {
    const result = await controller.getUserByRole('CEO');
    expect(result).toEqual(new OrganizationDto());
    expect(service.getUserByRole).toHaveBeenCalledWith('CEO');
  });

  it('should update user info', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'John Doe',
      description: 'Updated CEO',
    };
    const result = await controller.updateUserInfo('1', updateUserDto);
    expect(result).toEqual(new OrganizationDto());
    expect(service.updateUserInfo).toHaveBeenCalledWith('1', updateUserDto);
  });

  it('should delete user by ID', async () => {
    const result = await controller.deleteUser('1');
    expect(result).toBeUndefined();
    expect(service.deleteUser).toHaveBeenCalledWith('1');
  });

  it('should get user children by ID', async () => {
    const result = await controller.getUserChildrens('1');
    expect(result).toEqual([new OrganizationDto()]);
    expect(service.getUserChildren).toHaveBeenCalledWith('1');
  });
});
