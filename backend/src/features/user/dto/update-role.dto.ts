import { IsIn } from 'class-validator';

// Roles assignable via the admin role endpoint. Allowlist prevents arbitrary/garbage
// role strings from being persisted (privilege-changing endpoint).
export const ASSIGNABLE_ROLES = ['user', 'admin', 'moderator', 'super admin'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

// Roles that grant admin-level privileges — used to guarantee the system never
// loses its last admin via a role change.
export const ADMIN_LEVEL_ROLES = ['admin', 'super admin'];

export class UpdateRoleDto {
  @IsIn([...ASSIGNABLE_ROLES], {
    message: `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`,
  })
  role: AssignableRole;
}
