import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
@Entity('organization')
@Tree('closure-table')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  description: string;

  @TreeChildren()
  children: OrganizationEntity[];

  @TreeParent()
  parent: OrganizationEntity;
}
