import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  UserCircle,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';
import { TeamMemberInput } from '../types';

const INITIAL_MEMBERS: TeamMemberInput[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'Backend Engineer',
    avatar: 'carlos',
    activities: '',
    submittedAt: '',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Full-Stack Developer',
    avatar: 'sarah',
    activities: '',
    submittedAt: '',
  },
  {
    id: '3',
    name: 'Marcus Thorne',
    role: 'DevOps Engineer',
    avatar: 'marcus',
    activities: '',
    submittedAt: '',
  },
  {
    id: '4',
    name: 'Ana Gutiérrez',
    role: 'Frontend Engineer',
    avatar: 'ana',
    activities: '',
    submittedAt: '',
  },
];

const PROMPTS = [
  '¿Qué herramientas o tecnologías usas a diario?',
  '¿Cuál es la parte más retadora de tu trabajo actual?',
  '¿Qué tipo de persona crees que haría un buen fit en el equipo?',
  '¿Qué actividades ocupan la mayor parte de tu semana?',
];

export const TeamInputs: React.FC = () => {
  const [members, setMembers] = useState<TeamMemberInput[]>(INITIAL_MEMBERS);
  const [activeMember, setActiveMember] = useState<string>('1');

  const handleActivityChange = (id: string, value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, activities: value } : m))
    );
  };

  const handleSubmit = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, submittedAt: new Date().toLocaleString('es-MX') } : m
      )
    );
  };

  const current = members.find((m) => m.id === activeMember)!;
  const submittedCount = members.filter((m) => m.submittedAt).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
          <span className="opacity-50">TripleA</span>
          <span className="mx-2 opacity-50">/</span>
          <span>Team Inputs</span>
        </nav>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
              Actividades del Equipo
            </h2>
            <p className="text-on-surface-variant mt-1">
              Cada integrante describe sus actividades diarias de forma informal para generar un perfil real de la vacante.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
            <CheckCircle2 className="text-secondary" size={14} />
            <span className="text-xs font-bold text-on-surface-variant">
              {submittedCount}/{members.length} enviados
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Member list */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-outline ml-2 mb-2">
            Miembros del Equipo
          </p>
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setActiveMember(member.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                activeMember === member.id
                  ? 'bg-primary-container text-white shadow-md'
                  : 'bg-surface-container-lowest hover:bg-surface-container-high shadow-sm'
              }`}
            >
              <img
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                src={`https://picsum.photos/seed/${member.avatar}/100/100`}
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 text-left">
                <p className={`text-sm font-bold ${activeMember === member.id ? '' : 'text-on-surface'}`}>
                  {member.name}
                </p>
                <p className={`text-[10px] font-medium ${activeMember === member.id ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                  {member.role}
                </p>
              </div>
              {member.submittedAt ? (
                <CheckCircle2 className={activeMember === member.id ? 'text-secondary-fixed-dim' : 'text-secondary'} size={18} />
              ) : (
                <Clock className={activeMember === member.id ? 'text-on-primary-container' : 'text-outline-variant'} size={18} />
              )}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <img
                alt={current.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-surface-container-highest"
                src={`https://picsum.photos/seed/${current.avatar}/100/100`}
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface">{current.name}</h3>
                <p className="text-sm text-on-surface-variant">{current.role}</p>
              </div>
              {current.submittedAt && (
                <span className="ml-auto px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">
                  Enviado · {current.submittedAt}
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="text-secondary" size={16} />
                <label className="text-[10px] font-black uppercase tracking-widest text-outline">
                  ¿Qué haces en tu día a día? Cuéntanos informal
                </label>
              </div>
              <textarea
                value={current.activities}
                onChange={(e) => handleActivityChange(current.id, e.target.value)}
                disabled={!!current.submittedAt}
                className="w-full bg-surface-container-low border-none rounded-xl p-5 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none disabled:opacity-60"
                placeholder={"Escribe como si le explicaras a un amigo lo que haces...\n\nEjemplo:\nPues básicamente me la paso haciendo APIs en Go, revisando PRs del equipo y peleando con Kubernetes cuando algo truena en staging. También hago pair programming con los juniors y a veces toco la base de datos cuando hay queries lentos."}
                rows={8}
              />
            </div>

            {/* Quick prompts */}
            {!current.submittedAt && (
              <div className="p-4 bg-surface-container-low rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-amber-500" size={14} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-outline">Ideas para escribir</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        handleActivityChange(
                          current.id,
                          current.activities + (current.activities ? '\n\n' : '') + prompt + '\n'
                        )
                      }
                      className="text-left p-3 bg-surface-container-lowest text-on-surface-variant text-xs font-medium rounded-lg border border-outline-variant/20 hover:border-secondary hover:text-secondary transition-all"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!current.submittedAt && (
              <button
                onClick={() => handleSubmit(current.id)}
                disabled={!current.activities.trim()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                  current.activities.trim()
                    ? 'bg-secondary text-white hover:opacity-90 cursor-pointer shadow-lg'
                    : 'bg-surface-container-high text-outline cursor-not-allowed'
                }`}
              >
                <Send size={16} />
                Enviar mis actividades
              </button>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="bg-primary-container text-white p-6 rounded-2xl shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -mr-10 -mt-10 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="text-secondary" size={20} />
                <h4 className="font-headline text-sm font-bold uppercase tracking-wider">
                  Resumen de respuestas recibidas
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-[10px] uppercase font-bold text-on-primary-container mb-1">Enviados</p>
                  <p className="text-2xl font-black">{submittedCount}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-[10px] uppercase font-bold text-on-primary-container mb-1">Pendientes</p>
                  <p className="text-2xl font-black text-secondary-fixed-dim">{members.length - submittedCount}</p>
                </div>
              </div>
              {submittedCount === members.length && (
                <p className="mt-4 text-xs text-secondary-fixed-dim font-bold">
                  ✓ Todas las respuestas recibidas. Ve al Generator para que RH procese la vacante.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
