export const chatConfig = {
    // Configuración de límites
    limits: {
        maxMessageLength: 1000,
        maxConcurrentChatsPerAgent: 20,
        defaultMaxConcurrentChats: 5,
        maxMessagesPerMinute: 20,
    },

    // Configuración de refetch
    refetch: {
        messages: 5000, // 5 segundos
        sessions: 30000, // 30 segundos
        stats: 60000, // 1 minuto
    },

    // Configuración de prioridades
    priorities: {
        default: 'medium',
        escalation: {
            pending: 30, // minutos antes de escalar
            active: 60, // minutos antes de escalar
        }
    },

    // Configuración de estados
    status: {
        autoClose: {
            inactive: 24 * 60 * 60 * 1000, // 24 horas de inactividad
        }
    },

    // Configuración de notificaciones
    notifications: {
        newMessage: true,
        sessionAssigned: true,
        sessionClosed: true,
    },

    // Configuración de base de datos
    database: {
        pagination: {
            defaultLimit: 20,
            maxLimit: 100,
        }
    }
};
