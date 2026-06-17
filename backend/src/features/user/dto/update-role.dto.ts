import { IsIn } from 'class-validator';

// Roles assignable via the admin role endpoint. Allowlist prevents arbitrary/garbage
// role strings from being persisted (privilege-changing endpoint).
// NOTE: confirm the exact 'super admin' string + whether 'moderator' (used by the
// forum guards) should also be assignable here.
export const ASSIGNABLE_ROLES = ['user', 'admin', 'super admin'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class UpdateRoleDto {
  @IsIn([...ASSIGNABLE_ROLES], {
    message: `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`,
  })
  role: AssignableRole;
}
