// Serviço de Notificações Push do Navegador
export class NotificationService {
    private static PERMISSION_KEY = 'petmatch_notification_permission';

    // Verificar se o navegador suporta notificações
    static isSupported(): boolean {
        return 'Notification' in window;
    }

    // Obter status atual de permissão
    static getPermissionStatus(): NotificationPermission {
        if (!this.isSupported()) return 'denied';
        return Notification.permission;
    }

    // Solicitar permissão ao usuário
    static async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn('Notificações não são suportadas neste navegador');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Permissão de notificação foi negada anteriormente');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';

            localStorage.setItem(this.PERMISSION_KEY, granted ? 'granted' : 'denied');

            if (granted) {
                // Enviar notificação de teste
                this.sendTestNotification();
            }

            return granted;
        } catch (error) {
            console.error('Erro ao solicitar permissão de notificação:', error);
            return false;
        }
    }

    // Enviar notificação de teste
    static sendTestNotification() {
        this.sendNotification({
            title: '🐾 PetMatch - Notificações Ativadas!',
            body: 'Você receberá lembretes sobre a saúde dos seus pets.',
            icon: '/logo.png',
            badge: '/logo.png'
        });
    }

    // Enviar notificação
    static sendNotification(options: {
        title: string;
        body: string;
        icon?: string;
        badge?: string;
        tag?: string;
        data?: any;
    }) {
        if (!this.isSupported() || Notification.permission !== 'granted') {
            console.warn('Não é possível enviar notificação - permissão não concedida');
            return;
        }

        try {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/logo.png',
                badge: options.badge || '/logo.png',
                tag: options.tag || 'petmatch-reminder',
                requireInteraction: true, // Notificação fica até usuário clicar
                data: options.data
            });

            // Ao clicar, focar na janela/aba do app
            notification.onclick = () => {
                window.focus();
                notification.close();

                // Se tiver URL nos dados, navegar
                if (options.data?.url) {
                    window.location.href = options.data.url;
                }
            };

            return notification;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }

    // Enviar lembrete de vacina
    static sendVaccineReminder(petName: string, vaccineName: string, daysLeft: number) {
        const emoji = daysLeft === 0 ? '🚨' : daysLeft <= 3 ? '⚠️' : '💉';
        const urgency = daysLeft === 0 ? 'HOJE!' : daysLeft === 1 ? 'amanhã' : `em ${daysLeft} dias`;

        this.sendNotification({
            title: `${emoji} Lembrete: Vacina do ${petName}`,
            body: `A vacina "${vaccineName}" está programada para ${urgency}`,
            tag: `vaccine-${petName}-${vaccineName}`,
            data: { type: 'vaccine', petName, vaccineName, daysLeft }
        });
    }

    // Enviar lembrete de consulta
    static sendConsultationReminder(petName: string, description: string, date: string) {
        this.sendNotification({
            title: `🏥 Consulta do ${petName}`,
            body: `${description} - ${date}`,
            tag: `consultation-${petName}`,
            data: { type: 'consultation', petName, description, date }
        });
    }

    // Enviar lembrete de medicamento
    static sendMedicineReminder(petName: string, description: string) {
        this.sendNotification({
            title: `💊 Hora do remédio - ${petName}`,
            body: description,
            tag: `medicine-${petName}`,
            data: { type: 'medicine', petName, description }
        });
    }

    // Enviar lembrete de cirurgia
    static sendSurgeryReminder(petName: string, description: string, date: string) {
        this.sendNotification({
            title: `⚕️ Cirurgia agendada - ${petName}`,
            body: `${description} - ${date}`,
            tag: `surgery-${petName}`,
            data: { type: 'surgery', petName, description, date }
        });
    }
}

export default NotificationService;
