import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from 'src/entities/organization.entity';
import { InsertResult, TreeRepository } from 'typeorm';
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

    if (!node) {
      throw new BadRequestException('User with this id not found');
    }

    return node;
  }

  async getUserByRole(role: string): Promise<OrganizationEntity> {
    const node = await this.findRole(role);
    if (!node) {
      throw new BadRequestException('Role not found');
    }
    return node;
  }

  async insertRole(user: CreateUserDto) {
    const [rootRole, parentEntity] = await Promise.all([
      this.findRootRole(),
      user.reportTo ? this.getUserById(user.reportTo) : Promise.resolve(null),
    ]);

    // If there is a root role and if the root role is the same as the input
    if (rootRole.length && user.role === rootRole[0].role) {
      throw new BadRequestException(
        'User cannot have the same role as the root',
      );
    }

    if (rootRole.length !== 0 && !user.reportTo) {
      throw new BadRequestException('User should report to a role.');
    }

    const newUser = this.organizationRepository.create({
      name: user.name,
      description: user.description,
      parent: parentEntity,
      role: user.role,
    });

    const savedUser = await this.organizationRepository.save(newUser);

    // If there are children, create and associate them with the new user
    if (user.children && user.children.length > 0) {
      const childrenEntities = user.children.map((child) => {
        return this.organizationRepository.create({
          name: child.name,
          description: child.description,
          parent: savedUser,
          role: child.role,
        });
      });

      await this.organizationRepository.save(childrenEntities);

      return {
        message: 'User and children successfully created',
        user: savedUser.id,
      };
    }
  }

  async updateUserInfo(id: string, user: UpdateUserDto) {
    // Prepare the update payload
    const updatePayload: Partial<OrganizationEntity> = {};

    // Check if `reportTo` is valid and doesn’t cause circular reporting
    if (user.reportTo) {
      if (id === user.reportTo) {
        throw new BadRequestException('User cannot report to itself');
      }

      // Ensure `reportTo` exists in the database and fetch the user in one query
      const newParent = await this.getUserById(user.reportTo);

      // Check if the new parent id is the children of the current id.
      if (newParent.parent.id === id) {
        throw new BadRequestException('Children cannot be a new parent.');
      }

      // Set the new parent entity in the update payload
      updatePayload.parent = newParent;
    }

    // Add other fields to the update payload, filtering out undefined and empty values
    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'reportTo') {
        updatePayload[key] = value;
      }
    });

    // Only throw an error if there are no fields to update and no `reportTo`
    if (Object.keys(updatePayload).length === 0 && !user.reportTo) {
      throw new BadRequestException('No valid fields provided for update');
    }

    // Execute the update with the complete payload, including the parent if set
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
    // Find the user to delete along with their parent and children in one query
    const user = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    console.log(user);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if the user has no parent (indicating a root user)
    if (!user.parent && !user.children) {
      throw new BadRequestException('Cannot delete root user with children');
    }

    // Reassign children to the parent in one go
    if (user.children && user.children.length > 0) {
      const updatedChildren = user.children.map((child) => {
        child.parent = user.parent;
        return child;
      });

      // Perform bulk update of children
      await this.organizationRepository.save(updatedChildren); // Save all updated children in a single call
    }

    return await this.organizationRepository.remove(user);
  }
}
