import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from 'src/entities/organization.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async getOrganization() {
    return await this.organizationRepository.find();
  }

  async getUserById(id: string) {
    return await this.organizationRepository.findOneBy({ id: id });
  }

  async getUserByRole(role: string) {
    return await this.organizationRepository.findOneBy({ role });
  }

  async insertRole(user: CreateUserDto) {
    if (!user.role || user.role == '') {
      // 1. Check if the db is empty
      const org = await this.getOrganization();

      // 2. If its empty make the first user the ceo
      if (org.length === 0) {
        user.role = 'CEO';
      } else {
        throw new BadRequestException('Invalid user format');
      }
    } else if (user.role === 'CEO') {
      const userFound = await this.getUserByRole('CEO');

      if (userFound) {
        throw new BadRequestException('User can not be this role');
      }
    }

    // 4. Check validity of the user and save.
    const parentEntity = user.reportTo
      ? await this.getUserById(user.reportTo)
      : null;

    const newUser = this.organizationRepository.create({
      name: user.name,
      description: user.description,
      children: [],
      parent: parentEntity,
      role: user.role,
    });

    return this.organizationRepository.save(newUser);
  }
}
