import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegisteredPet, PlatformUser } from '../types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: typeof autoTable;
    }
}

export const generatePetReport = (pets: RegisteredPet[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(85, 166, 48); // Green
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PetMatch - Relatório de Animais', pageWidth / 2, 20, { align: 'center' });

    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(139, 69, 19);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 40);

    // Summary stats
    const totalPets = pets.length;
    const dogs = pets.filter(p => p.type === 'dog').length;
    const cats = pets.filter(p => p.type === 'cat').length;
    const adoption = pets.filter(p => p.adoptionType === 'adoption').length;
    const sponsorship = pets.filter(p => p.adoptionType === 'sponsorship').length;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Geral', 14, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Animais: ${totalPets}`, 14, 58);
    doc.text(`Cães: ${dogs} | Gatos: ${cats}`, 14, 64);
    doc.text(`Adoção: ${adoption} | Apadrinhamento: ${sponsorship}`, 14, 70);

    // Table data
    const tableData = pets.map(pet => [
        pet.name || 'Sem nome',
        pet.type === 'dog' ? 'Cão' : 'Gato',
        pet.breed || 'SRD',
        pet.age || 'N/A',
        pet.gender === 'Macho' ? 'M' : 'F',
        pet.status === 'approved' ? 'Aprovado' : pet.status === 'pending' ? 'Pendente' : 'Rejeitado'
    ]);

    autoTable(doc, {
        startY: 80,
        head: [['Nome', 'Tipo', 'Raça', 'Idade', 'Sexo', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [85, 166, 48],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [93, 46, 10]
        },
        alternateRowStyles: {
            fillColor: [241, 223, 207]
        },
        margin: { left: 14, right: 14 }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(139, 69, 19);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`PetMatch_Relatorio_Animais_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateUserReport = (users: PlatformUser[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(85, 166, 48);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PetMatch - Relatório de Usuários', pageWidth / 2, 20, { align: 'center' });

    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(139, 69, 19);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 40);

    // Summary
    const totalUsers = users.length;
    const volunteers = users.filter(u => u.type === 'volunteer').length;
    const partners = users.filter(u => u.type === 'partner').length;
    const approved = users.filter(u => u.status === 'approved').length;
    const pending = users.filter(u => u.status === 'pending').length;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Geral', 14, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Usuários: ${totalUsers}`, 14, 58);
    doc.text(`Voluntários: ${volunteers} | Parceiros: ${partners}`, 14, 64);
    doc.text(`Aprovados: ${approved} | Pendentes: ${pending}`, 14, 70);

    // Table
    const tableData = users.map(user => [
        user.name || 'Sem nome',
        user.email,
        user.type === 'volunteer' ? 'Voluntário' : user.type === 'partner' ? 'Parceiro' : 'Admin',
        user.status === 'approved' ? 'Aprovado' : 'Pendente',
        user.city || 'N/A'
    ]);

    autoTable(doc, {
        startY: 80,
        head: [['Nome', 'Email', 'Tipo', 'Status', 'Cidade']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [85, 166, 48],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [93, 46, 10]
        },
        alternateRowStyles: {
            fillColor: [241, 223, 207]
        },
        margin: { left: 14, right: 14 }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(139, 69, 19);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`PetMatch_Relatorio_Usuarios_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateFullReport = (pets: RegisteredPet[], users: PlatformUser[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(85, 166, 48);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PetMatch - Relatório Completo', pageWidth / 2, 20, { align: 'center' });

    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(139, 69, 19);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 40);

    // Overall Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estatísticas Gerais da Plataforma', 14, 55);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Animais:', 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total: ${pets.length} | Cães: ${pets.filter(p => p.type === 'dog').length} | Gatos: ${pets.filter(p => p.type === 'cat').length}`, 14, 72);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Usuários:', 14, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total: ${users.length} | Voluntários: ${users.filter(u => u.type === 'volunteer').length} | Parceiros: ${users.filter(u => u.type === 'partner').length}`, 14, 89);

    // Add page for detailed pet data
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(93, 46, 10);
    doc.text('Detalhamento - Animais', 14, 20);

    const petTableData = pets.slice(0, 50).map(pet => [
        pet.name || 'Sem nome',
        pet.type === 'dog' ? 'Cão' : 'Gato',
        pet.breed || 'SRD',
        pet.status === 'approved' ? 'Aprovado' : 'Pendente'
    ]);

    autoTable(doc, {
        startY: 30,
        head: [['Nome', 'Tipo', 'Raça', 'Status']],
        body: petTableData,
        theme: 'grid',
        headStyles: { fillColor: [85, 166, 48], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [93, 46, 10] },
        alternateRowStyles: { fillColor: [241, 223, 207] }
    });

    // Add page for user data
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento - Usuários', 14, 20);

    const userTableData = users.slice(0, 50).map(user => [
        user.name || 'Sem nome',
        user.email,
        user.type === 'volunteer' ? 'Voluntário' : 'Parceiro',
        user.status === 'approved' ? 'Aprovado' : 'Pendente'
    ]);

    autoTable(doc, {
        startY: 30,
        head: [['Nome', 'Email', 'Tipo', 'Status']],
        body: userTableData,
        theme: 'grid',
        headStyles: { fillColor: [85, 166, 48], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [93, 46, 10] },
        alternateRowStyles: { fillColor: [241, 223, 207] }
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(139, 69, 19);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`PetMatch_Relatorio_Completo_${new Date().toISOString().split('T')[0]}.pdf`);
};
