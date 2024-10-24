import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from 'src/entities/organization.entity';
import { TreeRepository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: TreeRepository<OrganizationEntity>,
  ) {}

  // Helper functions
  async findRole(role: string) {
    return await this.organizationRepository.findOneBy({ role });
  }

  async returnTree(node: OrganizationEntity) {
    if (!node) {
      throw new BadRequestException("user doesn't exist");
    }
    return await this.organizationRepository.findDescendantsTree(node);
  }

  // ....

  async getOrganization() {
    return await this.organizationRepository.findTrees();
  }

  async getUserById(id: string) {
    const node = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    return this.returnTree(node);
  }

  async getUserByRole(role: string) {
    const node = await this.findRole(role);
    return this.returnTree(node);
  }

  async insertRole(user: CreateUserDto) {
    if (user.role === 'CEO') {
      const userFound = await this.findRole('CEO');

      if (userFound) {
        throw new BadRequestException('User can not be this role');
      }
    } else if (!user.reportTo) {
      throw new BadRequestException('User should report to a role.');
    }

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

    return await this.organizationRepository.save(newUser);
  }

  async updateUserInfo(id: string, user: UpdateUserDto) {
    const userFound = await this.organizationRepository.findOneBy({ id });

    if (!userFound) {
      throw new BadRequestException("user doesn't exist");
    }

    if (user.reportTo) {
      if (id === user.reportTo) {
        throw new BadRequestException('user cannot report to itself');
      }

      const newParent = await this.getUserById(user.reportTo);
      userFound.parent = newParent;
    }

    // Update only the provided fields
    Object.assign(userFound, user);

    return this.returnTree(await this.organizationRepository.save(userFound));
  }

  async getUserChildren(id: string) {
    const userFound = await this.organizationRepository.findOneBy({ id });

    if (!userFound) {
      throw new BadRequestException("user doesn't exist");
    }

    const children = await this.organizationRepository.findDescendants(
      userFound,
    );
    return children.slice(1);
  }

  async deleteUser(id: string) {
    // Find the user to delete
    const user = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!user) {
      throw new BadRequestException("user doesn't exist");
    }
    console.log(user);
    console.log(user.parent);

    // Get the parent's reference
    const parent = user.parent;

    // Check if the user has no parent (indicating a root user)
    if (!parent) {
      throw new BadRequestException('Cannot delete root user');
    }

    // Get the children of the user
    const userChildren = await this.getUserChildren(id);

    // If there are children, reassign them to the parent
    if (userChildren.length > 0) {
      for (let child of userChildren) {
        child.parent = parent;
        await this.organizationRepository.save(child);
      }
    }

    await this.organizationRepository.remove(user);
  }
}
