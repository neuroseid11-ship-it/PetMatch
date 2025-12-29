import React, { useState } from 'react';
import { 
  HelpCircle, UserPlus, Target, Coins, Heart, 
  ShoppingBag, ShieldCheck, ChevronRight, Info,
  Search, Star, Gift, HandHelping, Users, Sparkles, Building2,
  X, Send, CheckCircle, User, Mail, AlertCircle
} from 'lucide-react';
import { messageService } from '../services/messageService';

const FAQ: React.FC = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (supportName.trim() && supportEmail.trim() && supportMessage.trim()) {
      messageService.send({
        petId: 'support-faq',
        petName: 'Suporte FAQ / Ajuda',
        petImage: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        userName: supportName,
        userEmail: supportEmail,
        message: supportMessage,
        type: 'direct_contact'
      });
      setIsSent(true);
      setTimeout(() => {
        setIsSupportModalOpen(false);
        setIsSent(false);
        setSupportName('');
        setSupportEmail('');
        setSupportMessage('');
      }, 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
        <div className="flex items-center gap-4">
          <HelpCircle size={40} className="text-[#55a630] flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-black text-[#5d2e0a] tracking-tight leading-none">Como Funciona a PetMatch</h1>
            <p className="text-[#8b4513] text-sm font-medium italic mt-1">Tudo o que você precisa saber para começar sua jornada.</p>
          </div>
        </div>
      </header>

      <section className="wood-panel p-8 md:p-12 rounded-[50px] border-4 border-[#c9a688] shadow-2xl bg-[#fdfaf7] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 grass-bg opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        
        <div className="text-center mb-12">
           <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter">O Ciclo do Bem</h2>
           <p className="text-[#8b4513] font-bold text-xs uppercase tracking-widest mt-1">Siga os passos e transforme vidas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 border-t-2 border-dashed border-[#c9a688]/40"></div>

          <StepCard num="1" icon={<UserPlus size={32} />} title="Cadastro" desc="Escolha seu perfil: Voluntário (Guardião) ou Empresa Parceira." />
          <StepCard num="2" icon={<Target size={32} />} title="O Match" desc="Encontre um pet ou projeto que ressoe com seu coração." />
          <StepCard num="3" icon={<Coins size={32} />} title="PetCoins" desc="Ganhe moedas realizando missões e interagindo na rede." />
          <StepCard num="4" icon={<ShoppingBag size={32} />} title="Recompensas" desc="Troque suas moedas na loja por produtos e cursos exclusivos." />
          <StepCard num="5" icon={<Heart size={32} />} title="Impacto" desc="Veja sua ajuda se transformar em lares felizes." />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h2 className="text-2xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-3 ml-2">
              <ShieldCheck className="text-[#55a630]" /> Regras de Convivência
           </h2>
           <div className="wood-panel rounded-[40px] border-2 border-[#c9a688] shadow-xl overflow-hidden divide-y-2 divide-[#c9a688]/20 bg-white">
              <RuleItem icon={<CheckCircle size={20} />} title="Respeito Mútuo" desc="Trate todos os guardiões e protetores com educação e empatia." />
              <RuleItem icon={<AlertCircle size={20} />} title="Veracidade" desc="Todas as informações sobre os animais devem ser 100% reais." />
              <RuleItem icon={<Heart size={20} />} title="Adoção Responsável" desc="Adoção é um compromisso para toda a vida do animal." />
           </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-2xl font-black text-[#5d2e0a] uppercase tracking-tighter flex items-center gap-3 ml-2">
              <Sparkles className="text-amber-500" /> Entenda os Símbolos
           </h2>
           <div className="wood-panel p-8 rounded-[40px] border-2 border-[#c9a688] shadow-xl space-y-6 bg-white">
              <SymbolItem icon={<ShieldCheck size={20} />} label="Parceiro Verificado" desc="Empresa ou ONG que passou por auditoria documental." />
              <SymbolItem icon={<Star size={20} />} label="Guardião Especialista" desc="Usuário com alto nível de engajamento e missões concluídas." />
              <SymbolItem icon={<AlertCircle size={20} />} label="Alerta Solidário" desc="Foco total na localização de um animal perdido." />
           </div>
        </div>
      </div>

      <section className="wood-panel p-8 md:p-12 rounded-[50px] border-4 border-[#c9a688] shadow-2xl bg-[#e6cbb3] text-center space-y-6">
         <h2 className="text-3xl font-black text-[#5d2e0a] uppercase tracking-tighter">Ainda tem dúvidas?</h2>
         <p className="text-[#8b4513] font-medium max-w-2xl mx-auto italic">
           Nossa equipe de gestão está pronta para ajudar você a navegar na rede e tirar o melhor proveito da plataforma.
         </p>
         <button 
           onClick={() => setIsSupportModalOpen(true)}
           className="grass-bg px-12 py-5 rounded-3xl text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] hover:translate-y-[-2px] transition-transform flex items-center gap-3 mx-auto"
         >
           Falar com Suporte <Send size={24} />
         </button>
      </section>

      {isSupportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95">
            <button onClick={() => setIsSupportModalOpen(false)} className="absolute top-6 right-6 text-[#5d2e0a]"><X size={24} /></button>
            {isSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] animate-bounce">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#5d2e0a]">Solicitação Enviada!</h2>
                <p className="text-[#8b4513] font-medium italic">Retornaremos seu contato em até 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="space-y-6">
                <h2 className="text-3xl font-black text-[#5d2e0a] text-center">Fale Conosco</h2>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Seu Nome</label>
                      <input required value={supportName} onChange={e => setSupportName(e.target.value)} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Seu E-mail</label>
                      <input required type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#8b4513] uppercase ml-4">Mensagem</label>
                      <textarea required rows={4} value={supportMessage} onChange={e => setSupportMessage(e.target.value)} className="w-full wood-inner p-4 text-sm border-2 border-[#c9a688] outline-none" />
                   </div>
                </div>
                <button type="submit" className="w-full grass-bg py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-6 border-[#3d7a22] flex items-center justify-center gap-4">
                  Enviar Mensagem <Send size={24} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-componentes do FAQ
const StepCard = ({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) => (
  <div className="relative flex flex-col items-center text-center space-y-4 z-10 group">
    <div className="w-20 h-20 grass-bg rounded-3xl flex items-center justify-center text-white border-4 border-[#3d7a22] shadow-xl group-hover:scale-110 transition-transform relative">
      {icon}
      <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#5d2e0a] rounded-full flex items-center justify-center border-2 border-white text-white font-black text-xs shadow-lg">
        {num}
      </div>
    </div>
    <div>
      <h4 className="text-sm font-black text-[#5d2e0a] uppercase tracking-tighter">{title}</h4>
      <p className="text-[10px] text-[#8b4513] font-bold leading-tight mt-1 px-2">{desc}</p>
    </div>
  </div>
);

const RuleItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4 p-6 wood-inner border border-[#c9a688]/30 hover:bg-[#fdfaf7] transition-colors">
    <div className="text-[#55a630] flex-shrink-0 mt-1">{icon}</div>
    <div className="space-y-1">
      <h4 className="text-sm font-black text-[#5d2e0a] uppercase">{title}</h4>
      <p className="text-xs text-[#8b4513] font-medium leading-relaxed italic">{desc}</p>
    </div>
  </div>
);

const SymbolItem = ({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-12 h-12 wood-panel rounded-2xl flex items-center justify-center text-[#5d2e0a] group-hover:bg-[#55a630] group-hover:text-white transition-all shadow-md">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-[#5d2e0a] uppercase leading-none">{label}</p>
      <p className="text-[9px] font-bold text-[#8b4513] italic">{desc}</p>
    </div>
  </div>
);

export default FAQ;