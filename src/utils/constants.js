export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  MANAGER: 'manager',
  STAFF: 'staff'
};

export const PERMISSIONS = {
  superAdmin: [
    'manage_all_users',
    'manage_stores',
    'view_all_data',
    'manage_receivables',
    'approve_calls',
    'view_rankings'
  ],
  manager: [
    'manage_staff',
    'approve_calls',
    'manage_receivables',
    'view_rankings',
    'view_team_data'
  ],
  staff: [
    'check_in_out',
    'manage_own_schedule',
    'request_call',
    'view_own_data',
    'view_rankings'
  ]
};