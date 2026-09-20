export const ROLES = {
    INVESTIGADOR: 'INVESTIGADOR',
    PARTICIPANTE: 'PARTICIPANTE',
    ADMIN: 'ADMIN',
};

export const RUTAS_INICIO = {
    [ROLES.ADMIN]: '/admin',
    [ROLES.INVESTIGADOR]: '/dashboard',
    [ROLES.PARTICIPANTE]: '/home',
};

export const rutaInicioPorRol = (role) => RUTAS_INICIO[role] || '/home';

export const PERMISSIONS = {
    CREATE_PROGRAM: 'create_program',
    EDIT_PROGRAM: 'edit_program',
    DELETE_PROGRAM: 'delete_program',
    VIEW_PROGRAM: 'view_program',
    CREATE_SESSION: 'create_session',
    EDIT_SESSION: 'edit_session',
    DELETE_SESSION: 'delete_session',
    VIEW_SESSION: 'view_session',
    CREATE_QUESTIONNAIRE: 'create_questionnaire',
    EDIT_QUESTIONNAIRE: 'edit_questionnaire',
    DELETE_QUESTIONNAIRE: 'delete_questionnaire',
    VIEW_QUESTIONNAIRE: 'view_questionnaire',
    MANAGE_PARTICIPANTS: 'manage_participants',
    VIEW_PARTICIPANTS: 'view_participants',
    VIEW_STATISTICS: 'view_statistics',
    MANAGE_USERS: 'manage_users',
};

export const ROLE_PERMISSIONS = {
    [ROLES.INVESTIGADOR]: [
        PERMISSIONS.CREATE_PROGRAM,
        PERMISSIONS.EDIT_PROGRAM,
        PERMISSIONS.DELETE_PROGRAM,
        PERMISSIONS.VIEW_PROGRAM,
        PERMISSIONS.CREATE_SESSION,
        PERMISSIONS.EDIT_SESSION,
        PERMISSIONS.DELETE_SESSION,
        PERMISSIONS.VIEW_SESSION,
        PERMISSIONS.CREATE_QUESTIONNAIRE,
        PERMISSIONS.EDIT_QUESTIONNAIRE,
        PERMISSIONS.DELETE_QUESTIONNAIRE,
        PERMISSIONS.VIEW_QUESTIONNAIRE,
        PERMISSIONS.MANAGE_PARTICIPANTS,
        PERMISSIONS.VIEW_PARTICIPANTS,
        PERMISSIONS.VIEW_STATISTICS,
    ],
    [ROLES.PARTICIPANTE]: [
        PERMISSIONS.VIEW_PROGRAM,
        PERMISSIONS.VIEW_SESSION,
        PERMISSIONS.VIEW_QUESTIONNAIRE,
    ],
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
}; 