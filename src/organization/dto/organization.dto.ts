import { ApiProperty } from '@nestjs/swagger';

export class OrganizationDto {
  @ApiProperty({
    description: 'Unique Identifier',
  })
  id: string;

  @ApiProperty({
    description: 'The description of the user role',
  })
  name: string;

  @ApiProperty({
    description: 'The role of the user',
  })
  role: string;

  @ApiProperty({
    description: 'The List of organization that are under this role',
    type: () => OrganizationDto,
    isArray: true,
  })
  children: OrganizationDto[];

  @ApiProperty({
    description: 'The parent of the role',
    type: () => OrganizationDto,
    nullable: true,
  })
  parent: OrganizationDto;
}
