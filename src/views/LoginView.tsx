import React, { useState } from 'react'
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ClassicArchLogo } from '../components/ClassicArchLogo'

export const LoginView: React.FC = () => {
  const { login, signup, loginAsGuest, error, isLoading, clearError } = useAuth()
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email || !password) return

    if (isRegisterMode) {
      await signup(email, password, name || 'Membro da Ágora')
    } else {
      await login(email, password)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Blobs & Classical Grid Pattern */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-bg-surface border border-text-primary/15 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md">
        {/* Header Branding with Classical Arch Logo & Exact Official Slogan */}
        <ClassicArchLogo size="md" showSlogan={true} titleGraveAccent={true} />

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                Nome do Erudito
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs transition-colors"
                />
                <User className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              E-mail de Acesso
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs transition-colors"
              />
              <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              Senha de Segurança
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs transition-colors"
              />
              <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent-gold text-bg-base hover:bg-accent-gold-bright font-semibold text-xs rounded-xl uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent-gold/20 disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>{isRegisterMode ? 'Criar Conta Netlify' : 'Entrar na Ágora'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode & Visitor Action Button */}
        <div className="pt-2 border-t border-text-primary/10 space-y-3 text-center">
          <button
            type="button"
            onClick={() => {
              clearError()
              setIsRegisterMode(!isRegisterMode)
            }}
            className="text-xs text-accent-gold hover:underline font-medium transition-colors block w-full"
          >
            {isRegisterMode
              ? 'Já possui uma conta? Faça Login'
              : 'Ainda não tem conta? Registrar-se via Netlify Identity'}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-text-primary/10"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-text-secondary">ou</span>
            <div className="flex-grow border-t border-text-primary/10"></div>
          </div>

          <button
            type="button"
            onClick={loginAsGuest}
            className="w-full py-2.5 bg-bg-base hover:bg-bg-elevated text-text-primary border border-accent-gold/40 hover:border-accent-gold rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            <span>Entrar como Visitante</span>
          </button>
        </div>
      </div>
    </div>
  )
}
