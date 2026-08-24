export const ADMIN_MESSAGES = {
  selectUser: 'Please select a user.',

  createSuccess: (role: string) =>
    `${role} created successfully.`,

  removeSuccess: (username: string) =>
    `${username} has been removed from administrators.`,

  selfRemove:
    'You cannot remove your own Super Admin account.',

  loadError:
    'Failed to load admin management data.',

  createError:
    'Failed to create admin.',

  removeError:
    'Failed to remove administrator.',

  accessDenied:
    'Only Super Administrators can manage StreetGO administrators.',

  checkingPermissions:
    'Checking administrator permissions...',
} as const