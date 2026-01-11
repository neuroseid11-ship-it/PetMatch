import * as XLSX from 'xlsx';
import { RegisteredPet, PlatformUser } from '../types';

export class ExcelExporter {
    // Exportar pets para Excel
    static exportPets(pets: RegisteredPet[]) {
        const data = pets.map(p => ({
            'Nome': p.name,
            'Espécie': p.species === 'dog' ? 'Cão' : 'Gato',
            'Raça': p.breed || '---',
            'Idade': p.age || '---',
            'Porte': p.size || '---',
            'Comportamento': p.temperament || '---',
            'Cidade': p.city || '---',
            'Estado': p.state || '---',
            'Status': p.status === 'available' ? 'Disponível' : 'Adotado',
            'ONG': p.ongName || '---',
            'Data Cadastro': p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : '---'
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        // Ajustar largura das colunas
        const wscols = [
            { wch: 15 }, // Nome
            { wch: 10 }, // Espécie
            { wch: 15 }, // Raça
            { wch: 8 },  // Idade
            { wch: 10 }, // Porte
            { wch: 15 }, // Comportamento
            { wch: 15 }, // Cidade
            { wch: 8 },  // Estado
            { wch: 12 }, // Status
            { wch: 20 }, // ONG
            { wch: 12 }  // Data
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pets');

        const fileName = `PetMatch_Pets_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar usuários para Excel
    static exportUsers(users: PlatformUser[]) {
        const data = users.map(u => ({
            'Nome': u.name,
            'Email': u.email,
            'Tipo': u.type === 'volunteer' ? 'Voluntário' : 'Parceiro',
            'Telefone': u.phone || '---',
            'Documento': u.documentNumber || '---',
            'Cidade': u.city || '---',
            'Estado': u.state || '---',
            'Status': u.status === 'approved' ? 'Aprovado' : 'Pendente',
            'Data Cadastro': u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '---'
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        const wscols = [
            { wch: 25 }, // Nome
            { wch: 30 }, // Email
            { wch: 12 }, // Tipo
            { wch: 15 }, // Telefone
            { wch: 18 }, // Documento
            { wch: 15 }, // Cidade
            { wch: 8 },  // Estado
            { wch: 12 }, // Status
            { wch: 12 }  // Data
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuários');

        const fileName = `PetMatch_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar ONGs para Excel
    static exportOngs(ongs: any[], pets: RegisteredPet[]) {
        const data = ongs.map(ong => {
            const ongPets = pets.filter(p => p.ongId === ong.id);
            return {
                'Nome': ong.name,
                'Responsável': ong.responsavel || '---',
                'Email': ong.email || '---',
                'Telefone': ong.telefone || '---',
                'Cidade': ong.cidade || '---',
                'Estado': ong.estado || '---',
                'Total de Pets': ongPets.length,
                'Pets Disponíveis': ongPets.filter(p => p.status === 'available').length,
                'Pets Adotados': ongPets.filter(p => p.status === 'adopted').length
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);

        const wscols = [
            { wch: 25 }, // Nome
            { wch: 20 }, // Responsável
            { wch: 30 }, // Email
            { wch: 15 }, // Telefone
            { wch: 15 }, // Cidade
            { wch: 8 },  // Estado
            { wch: 12 }, // Total Pets
            { wch: 15 }, // Disponíveis
            { wch: 12 }  // Adotados
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ONGs');

        const fileName = `PetMatch_ONGs_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar mensagens para Excel
    static exportMessages(messages: any[]) {
        const data = messages.map(m => ({
            'Pet': m.petName,
            'Tipo': m.type === 'interest' ? 'Interesse em Adoção' : 'Agendamento de Visita',
            'Solicitante': m.userName,
            'Email': m.userEmail,
            'Telefone': m.userPhone || '---',
            'Mensagem': m.message || '---',
            'Data': m.visitDate ? new Date(m.visitDate).toLocaleDateString('pt-BR') : '---',
            'Horário': m.visitTime || '---',
            'Status': m.status === 'pending' ? 'Pendente' : 'Respondida',
            'Data Solicitação': m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : '---'
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        const wscols = [
            { wch: 20 }, // Pet
            { wch: 20 }, // Tipo
            { wch: 25 }, // Solicitante
            { wch: 30 }, // Email
            { wch: 15 }, // Telefone
            { wch: 40 }, // Mensagem
            { wch: 12 }, // Data
            { wch: 10 }, // Horário
            { wch: 12 }, // Status
            { wch: 15 }  // Data Solicitação
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Mensagens');

        const fileName = `PetMatch_Mensagens_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar produtos da loja para Excel
    static exportStore(products: any[]) {
        const data = products.map(p => ({
            'Produto': p.name,
            'Categoria': p.category,
            'Preço (PetCoins)': p.price,
            'Estoque': p.stock,
            'Descrição': p.description || '---',
            'Status': p.stock > 0 ? 'Disponível' : 'Esgotado'
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        const wscols = [
            { wch: 30 }, // Produto
            { wch: 15 }, // Categoria
            { wch: 15 }, // Preço
            { wch: 10 }, // Estoque
            { wch: 50 }, // Descrição
            { wch: 12 }  // Status
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Loja');

        const fileName = `PetMatch_Loja_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar ranking de gamificação para Excel
    static exportGamification(missions: any[], ranking: any[]) {
        // Sheet 1: Missões
        const missionsData = missions.map(m => ({
            'Missão': m.title,
            'Tipo': m.type === 'daily' ? 'Diária' : m.type === 'weekly' ? 'Semanal' : 'Especial',
            'Descrição': m.description,
            'XP': m.xp,
            'Coins': m.coins,
            'Status': m.active ? 'Ativa' : 'Inativa'
        }));

        const wsMissions = XLSX.utils.json_to_sheet(missionsData);
        wsMissions['!cols'] = [
            { wch: 30 },
            { wch: 12 },
            { wch: 50 },
            { wch: 8 },
            { wch: 8 },
            { wch: 10 }
        ];

        // Sheet 2: Ranking
        const rankingData = ranking.map(r => ({
            'Posição': r.rank_position,
            'Usuário': r.user_name,
            'Email': r.user_email,
            'XP Total': r.total_xp,
            'Coins': r.total_coins,
            'Nível': r.level,
            'Missões Completadas': r.missions_completed
        }));

        const wsRanking = XLSX.utils.json_to_sheet(rankingData);
        wsRanking['!cols'] = [
            { wch: 10 },
            { wch: 25 },
            { wch: 30 },
            { wch: 10 },
            { wch: 10 },
            { wch: 8 },
            { wch: 18 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsMissions, 'Missões');
        XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking');

        const fileName = `PetMatch_Gamificacao_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar parceiros para Excel
    static exportPartners(partners: PlatformUser[]) {
        const data = partners.map(p => ({
            'Nome': p.name,
            'Email': p.email,
            'Telefone': p.phone || '---',
            'CNPJ': p.documentNumber || '---',
            'Categoria': p.partnerProfile?.category || '---',
            'Cidade': p.city || '---',
            'Estado': p.state || '---',
            'Instagram': p.partnerProfile?.instagram || '---',
            '24h': p.partnerProfile?.is24h ? 'Sim' : 'Não',
            'Status': p.status === 'approved' ? 'Aprovado' : 'Pendente'
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        const wscols = [
            { wch: 30 },
            { wch: 30 },
            { wch: 15 },
            { wch: 18 },
            { wch: 15 },
            { wch: 15 },
            { wch: 8 },
            { wch: 20 },
            { wch: 8 },
            { wch: 12 }
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Parceiros');

        const fileName = `PetMatch_Parceiros_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar agendamentos para Excel
    static exportSchedules(visits: any[]) {
        const data = visits.map(v => ({
            'Pet': v.pet_name || v.petName,
            'Visitante': v.visitor_name || v.userName,
            'Email': v.visitor_email || v.userEmail,
            'Telefone': v.visitor_phone || v.userPhone || '---',
            'Data': v.visit_date ? new Date(v.visit_date).toLocaleDateString('pt-BR') : '---',
            'Horário': v.visit_time || v.visitTime || '---',
            'Endereço': v.address || '---',
            'Cidade': v.city || '---',
            'Estado': v.state || '---',
            'Status': v.status === 'pending' ? 'Pendente' :
                v.status === 'confirmed' ? 'Confirmada' :
                    v.status === 'completed' ? 'Realizada' : 'Cancelada',
            'Mensagem': v.message || '---'
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        const wscols = [
            { wch: 20 },
            { wch: 25 },
            { wch: 30 },
            { wch: 15 },
            { wch: 12 },
            { wch: 10 },
            { wch: 30 },
            { wch: 15 },
            { wch: 8 },
            { wch: 12 },
            { wch: 40 }
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');

        const fileName = `PetMatch_Agendamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // Exportar relatório completo (todos os módulos)
    static exportFullReport(data: {
        pets: RegisteredPet[];
        users: PlatformUser[];
        ongs: any[];
        messages: any[];
        products: any[];
        missions: any[];
        ranking: any[];
        partners: PlatformUser[];
        visits: any[];
    }) {
        const wb = XLSX.utils.book_new();

        // Sheet Pets
        const petsData = data.pets.map(p => ({
            Nome: p.name,
            Espécie: p.species === 'dog' ? 'Cão' : 'Gato',
            Raça: p.breed || '---',
            Status: p.status === 'available' ? 'Disponível' : 'Adotado'
        }));
        const wsPets = XLSX.utils.json_to_sheet(petsData);
        XLSX.utils.book_append_sheet(wb, wsPets, 'Pets');

        // Sheet Usuários
        const usersData = data.users.map(u => ({
            Nome: u.name,
            Email: u.email,
            Tipo: u.type === 'volunteer' ? 'Voluntário' : 'Parceiro',
            Status: u.status === 'approved' ? 'Aprovado' : 'Pendente'
        }));
        const wsUsers = XLSX.utils.json_to_sheet(usersData);
        XLSX.utils.book_append_sheet(wb, wsUsers, 'Usuários');

        // Sheet Ranking
        const rankingData = data.ranking.map(r => ({
            Posição: r.rank_position,
            Usuário: r.user_name,
            XP: r.total_xp,
            Nível: r.level
        }));
        const wsRanking = XLSX.utils.json_to_sheet(rankingData);
        XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking');

        const fileName = `PetMatch_Completo_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }
}

export default ExcelExporter;
