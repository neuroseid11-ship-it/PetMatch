import { UserPet, HealthEvent } from '../types';
import NotificationService from './notificationService';

export interface PetReminder {
    id: string;
    petId: string;
    petName: string;
    type: 'vaccine' | 'consultation' | 'medicine' | 'surgery';
    title: string;
    description: string;
    date: string;
    daysUntil: number;
    urgent: boolean;
}

export class ReminderService {
    // Verificar todos os pets do usuário e retornar lembretes pendentes
    static checkReminders(pets: UserPet[]): PetReminder[] {
        const reminders: PetReminder[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        pets.forEach(pet => {
            // Verificar vacinas
            if (pet.vaccines && pet.vaccines.length > 0) {
                pet.vaccines.forEach(vaccine => {
                    if (vaccine.nextDose) {
                        const nextDoseDate = new Date(vaccine.nextDose);
                        nextDoseDate.setHours(0, 0, 0, 0);
                        const daysUntil = Math.ceil((nextDoseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                        // Alertar 7 dias antes, 3 dias antes, 1 dia antes e no dia
                        if (daysUntil >= 0 && daysUntil <= 7) {
                            reminders.push({
                                id: `vaccine-${pet.id}-${vaccine.id}`,
                                petId: pet.id!,
                                petName: pet.name,
                                type: 'vaccine',
                                title: `Vacina: ${vaccine.name}`,
                                description: `Próxima dose da vacina ${vaccine.name}`,
                                date: vaccine.nextDose,
                                daysUntil,
                                urgent: daysUntil <= 1
                            });
                        }
                    }
                });
            }

            // Verificar eventos de saúde
            if (pet.healthEvents && pet.healthEvents.length > 0) {
                pet.healthEvents.forEach(event => {
                    if (event.date && !event.completed) {
                        const eventDate = new Date(event.date);
                        eventDate.setHours(0, 0, 0, 0);
                        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                        // Consultas e cirurgias: alertar 3 dias antes
                        if ((event.type === 'consultation' || event.type === 'surgery') && daysUntil >= 0 && daysUntil <= 3) {
                            reminders.push({
                                id: `${event.type}-${pet.id}-${event.id}`,
                                petId: pet.id!,
                                petName: pet.name,
                                type: event.type,
                                title: event.type === 'consultation' ? 'Consulta Veterinária' : 'Cirurgia',
                                description: event.description || 'Evento agendado',
                                date: event.date,
                                daysUntil,
                                urgent: daysUntil === 0
                            });
                        }

                        // Medicamentos: alertar no dia
                        if (event.type === 'medicine' && daysUntil === 0) {
                            reminders.push({
                                id: `medicine-${pet.id}-${event.id}`,
                                petId: pet.id!,
                                petName: pet.name,
                                type: 'medicine',
                                title: 'Medicamento',
                                description: event.description || 'Administrar medicamento',
                                date: event.date,
                                daysUntil: 0,
                                urgent: true
                            });
                        }
                    }
                });
            }
        });

        // Ordenar por urgência (mais urgente primeiro)
        return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
    }

    // Enviar notificações para lembretes pendentes
    static sendPendingNotifications(reminders: PetReminder[]) {
        if (!NotificationService.isSupported() || NotificationService.getPermissionStatus() !== 'granted') {
            return;
        }

        // Enviar no máximo 3 notificações por vez para não sobrecarregar
        const toNotify = reminders.slice(0, 3);

        toNotify.forEach(reminder => {
            switch (reminder.type) {
                case 'vaccine':
                    NotificationService.sendVaccineReminder(
                        reminder.petName,
                        reminder.title.replace('Vacina: ', ''),
                        reminder.daysUntil
                    );
                    break;
                case 'consultation':
                    NotificationService.sendConsultationReminder(
                        reminder.petName,
                        reminder.description,
                        this.formatDate(reminder.date)
                    );
                    break;
                case 'medicine':
                    NotificationService.sendMedicineReminder(
                        reminder.petName,
                        reminder.description
                    );
                    break;
                case 'surgery':
                    NotificationService.sendSurgeryReminder(
                        reminder.petName,
                        reminder.description,
                        this.formatDate(reminder.date)
                    );
                    break;
            }
        });
    }

    // Formatar data para exibição
    private static formatDate(dateString: string): string {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        date.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) {
            return 'Hoje';
        } else if (date.getTime() === tomorrow.getTime()) {
            return 'Amanhã';
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
            });
        }
    }

    // Verificar e enviar lembretes (chamar ao abrir o app ou diariamente)
    static async checkAndNotify(pets: UserPet[]) {
        const reminders = this.checkReminders(pets);

        // Salvar última verificação
        const lastCheck = localStorage.getItem('petmatch_last_reminder_check');
        const today = new Date().toDateString();

        // Só enviar notificações uma vez por dia
        if (lastCheck !== today && reminders.length > 0) {
            this.sendPendingNotifications(reminders);
            localStorage.setItem('petmatch_last_reminder_check', today);
        }

        return reminders;
    }
}

export default ReminderService;
