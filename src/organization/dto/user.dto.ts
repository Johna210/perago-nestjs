export class UserDto {
  id: string;

  name: string;

  description: string;

  role: string;

  reportTo: string;

  managingUnder: UserDto[];
}
