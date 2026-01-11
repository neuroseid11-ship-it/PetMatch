import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    PawPrint, Coins, Heart, Handshake,
    X, Send, CheckCircle, Info, Info as InfoIcon
} from 'lucide-react';
import { messageService } from '../services/messageService';

const Footer: React.FC = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isHelpProjectOpen, setIsHelpProjectOpen] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSendContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (contactMessage.trim() && contactEmail.trim() && contactName.trim()) {
            messageService.send({
                petId: 'support-footer',
                petName: 'Suporte Rodapé',
                petImage: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
                userName: contactName,
                userEmail: contactEmail,
                message: contactMessage,
                type: 'direct_contact'
            });
            setIsSent(true);
            setTimeout(() => {
                setIsContactOpen(false);
                setIsSent(false);
                setContactMessage('');
                setContactEmail('');
                setContactName('');
            }, 2500);
        }
    };

    return (
        <>
            <footer className="py-10 text-center text-[#5d2e0a] text-[10px] font-bold uppercase tracking-widest bg-[#e6cbb3] border-t-4 border-[#c9a688] relative z-20">
                <div className="flex flex-col items-center gap-3">
                    <PawPrint className="text-[#5d2e0a]/30 w-8 h-8" />
                    <span className="bg-[#f1dfcf] px-4 py-1 rounded-full border border-[#c9a688] shadow-inner">
                        © 2024 PETMATCH • Plataforma de gestão para adoção de pets
                    </span>
                    <div className="flex flex-wrap justify-center gap-6 mt-4 opacity-70">
                        <Link to="/faq" className="text-[#8b4513] font-black hover:text-[#55a630] transition-all">FAQ</Link>
                        <button onClick={() => setIsTermsOpen(true)} className="text-[#8b4513] font-black hover:text-[#55a630] transition-all">Termos</button>
                        <button onClick={() => setIsPrivacyOpen(true)} className="text-[#8b4513] font-black hover:text-[#55a630] transition-all">Privacidade</button>
                        <button onClick={() => setIsContactOpen(true)} className="text-[#8b4513] font-black hover:text-[#55a630] transition-all">Suporte</button>
                        <button onClick={() => setIsHelpProjectOpen(true)} className="text-[#8b4513] font-black hover:text-[#55a630] transition-all">Ajude o projeto</button>
                    </div>
                </div>
            </footer>

            {isTermsOpen && (
                <Modal title="Termos de Uso" onClose={() => setIsTermsOpen(false)}>
                    <div className="space-y-4 text-sm font-medium leading-relaxed">
                        <p>Ao utilizar a plataforma PetMatch, você concorda em seguir as diretrizes de adoção responsável e proteção animal.</p>
                        <p>Toda informação fornecida nos cadastros de animais e usuários deve ser verídica e passível de comprovação documental.</p>
                        <p>Os PetCoins ganhos são moedas virtuais de gamificação sem valor monetário real, podendo ser trocados apenas por itens disponíveis em nossa Loja de Recompensas.</p>
                    </div>
                </Modal>
            )}

            {isPrivacyOpen && (
                <Modal title="Política de Privacidade" onClose={() => setIsPrivacyOpen(false)}>
                    <div className="space-y-4 text-sm font-medium leading-relaxed">
                        <p>Seus dados são protegidos seguindo a LGPD. Coletamos informações de contato e documentos apenas para validação de segurança da nossa rede de guardiões.</p>
                        <p>Suas informações de localização aproximada são utilizadas no Mapa Solidário para facilitar resgates e adoções próximas a você.</p>
                        <p>Não compartilhamos seus dados com terceiros sem sua autorização explícita.</p>
                    </div>
                </Modal>
            )}

            {isHelpProjectOpen && (
                <Modal title="Ajude o Projeto" onClose={() => setIsHelpProjectOpen(false)}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-[#fdf5ed] p-4 rounded-2xl border border-[#c9a688]/30 shadow-inner">
                            <div className="w-12 h-12 grass-bg flex items-center justify-center text-white rounded-xl shadow-md">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#5d2e0a] uppercase">Contribuição PIX</h4>
                                <p className="text-[10px] text-[#8b4513] font-bold">Chave: xxx</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-[#fdf5ed] p-4 rounded-2xl border border-[#c9a688]/30 shadow-inner">
                            <div className="w-12 h-12 bg-red-50 flex items-center justify-center text-white rounded-xl shadow-md">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#5d2e0a] uppercase">Doações Físicas</h4>
                                <p className="text-[10px] text-[#8b4513] font-bold">Ração, Cobertores e Medicamentos.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-[#fdf5ed] p-4 rounded-2xl border border-[#c9a688]/30 shadow-inner">
                            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center text-white rounded-xl shadow-md">
                                <Handshake size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#5d2e0a] uppercase">Seja Voluntário</h4>
                                <p className="text-[10px] text-[#8b4513] font-bold">Ajude-nos em resgates e feiras.</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {isContactOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="wood-panel w-full max-w-md rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsContactOpen(false)}
                            className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"
                        >
                            <X size={24} className="opacity-60" />
                        </button>

                        {isSent ? (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce">
                                    <CheckCircle className="text-white" size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-[#5d2e0a]">Mensagem Enviada!</h2>
                                <p className="text-[#8b4513] font-medium italic">Responderemos sua solicitação em até 24 horas úteis.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b-2 border-[#c9a688]/30 pb-4">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#55a630] flex items-center justify-center">
                                        <InfoIcon size={24} className="text-[#55a630]" />
                                    </div>
                                    <h2 className="text-xl font-black text-[#5d2e0a] uppercase tracking-tighter">Suporte PetMatch</h2>
                                </div>

                                <form onSubmit={handleSendContact} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Seu Nome</label>
                                            <input
                                                required
                                                type="text"
                                                value={contactName}
                                                onChange={e => setContactName(e.target.value)}
                                                placeholder="Como você se chama?"
                                                className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none focus:ring-2 focus:ring-[#55a630]/10 transition-all font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Seu E-mail</label>
                                            <input
                                                required
                                                type="email"
                                                value={contactEmail}
                                                onChange={e => setContactEmail(e.target.value)}
                                                placeholder="email@exemplo.com"
                                                className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none focus:ring-2 focus:ring-[#55a630]/10 transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Mensagem</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={contactMessage}
                                            onChange={e => setContactMessage(e.target.value)}
                                            placeholder="Como podemos ajudar?"
                                            className="w-full wood-inner p-5 text-sm border-2 border-[#c9a688] outline-none focus:ring-2 focus:ring-[#55a630]/10 transition-all placeholder-[#8b4513]/40"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!contactMessage.trim() || !contactEmail.trim() || !contactName.trim()}
                                        className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                                    >
                                        ENVIAR MENSAGEM <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

const Modal = ({ title, children, onClose }: { title: string, children?: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="wood-panel w-full max-w-md rounded-[32px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95">
            <button onClick={onClose} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform"><X size={20} /></button>
            <h2 className="text-2xl font-black text-[#5d2e0a] mb-6 flex items-center gap-2 border-b-2 border-[#c9a688] pb-2 uppercase tracking-tighter">
                <Info size={24} className="text-[#55a630]" /> {title}
            </h2>
            {children}
        </div>
    </div>
);

export default Footer;
