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
  private async findRootRole() {
    return this.organizationRepository.findRoots();
  }

  private async findRole(role: string) {
    return await this.organizationRepository.findOneBy({ role });
  }

  private async returnTree(node: OrganizationEntity) {
    if (!node) {
      throw new BadRequestException('User not found');
    }
    return await this.organizationRepository.findDescendantsTree(node);
  }
  // ......

  async getOrganization(): Promise<OrganizationEntity[]> {
    return await this.organizationRepository.findTrees();
  }

  async getUserById(id: string): Promise<OrganizationEntity> {
    const node = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    return node;
  }

  async getUserByRole(role: string) {
    const node = await this.findRole(role);
    if (!node) {
      return new BadRequestException('Role not found');
    }
    return node;
  }

  async insertRole(user: CreateUserDto) {
    const [rootRole, parentEntity] = await Promise.all([
      this.findRootRole(),
      user.reportTo ? this.getUserById(user.reportTo) : Promise.resolve(null),
    ]);

    if (user.role === rootRole[0].role) {
      throw new BadRequestException('User cannot be this role');
    }

    if (!user.reportTo) {
      throw new BadRequestException('User should report to a role.');
    }

    const newUser = this.organizationRepository.create({
      name: user.name,
      description: user.description,
      parent: parentEntity,
      role: user.role,
    });

    return await this.organizationRepository.save(newUser);
  }

  async updateUserInfo(id: string, user: UpdateUserDto) {
    // Check if `reportTo` is valid and doesn’t cause circular reporting
    if (user.reportTo) {
      if (id === user.reportTo) {
        throw new BadRequestException('User cannot report to itself');
      }

      // Ensure `reportTo` exists in the database
      const newParent = await this.getUserById(user.reportTo);
      if (!newParent) {
        throw new BadRequestException('Invalid `reportTo` user');
      }

      // Set the `reportTo` relationship by updating `parentId` directly
      user.reportTo = newParent.id;

      console.log('Reached in the if clause');
    }

    // Remove undefined and empty values for cleaner updates
    const updatePayload = Object.fromEntries(
      Object.entries(user).filter(
        ([_, value]) => value !== undefined && value !== '',
      ),
    );

    // Check if `updatePayload` has any fields to update
    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    // Perform a direct update without loading the entity
    return await this.organizationRepository.update(id, updatePayload);
  }

  async getUserChildren(id: string) {
    // Find the user by ID
    const userFound = await this.organizationRepository.findOneBy({ id });

    // Check if the user exists
    if (!userFound) {
      throw new BadRequestException('User not found');
    }

    // Retrieve direct children
    const children = await this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.parentId = :id', { id })
      .getMany();

    return children;
  }

  async deleteUser(id: string) {
    // Find the user to delete
    const user = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

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

    return await this.organizationRepository.remove(user);
  }
}
