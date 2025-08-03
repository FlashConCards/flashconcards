'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const sendVerificationCode = async () => {
    if (!formData.email) {
      toast.error('Digite seu email primeiro');
      return;
    }

    setSendingCode(true);
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          displayName: formData.name
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Código enviado para seu email!');
        setCodeSent(true);
      } else {
        toast.error(data.error || 'Erro ao enviar código');
      }
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      toast.error('Erro ao enviar código de verificação');
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!formData.verificationCode) {
      toast.error('Digite o código de verificação');
      return;
    }

    setVerifyingCode(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Código verificado com sucesso!');
        // Continuar com o registro
        await completeRegistration();
      } else {
        toast.error(data.error || 'Erro ao verificar código');
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast.error('Erro ao verificar código');
    } finally {
      setVerifyingCode(false);
    }
  };

  const completeRegistration = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        displayName: formData.name,
        isAdmin: false,
        isPaid: false,
        isActive: true,
        studyTime: 0,
        cardsStudied: 0,
        cardsCorrect: 0,
        cardsWrong: 0
      };

      await register(formData.email, formData.password, userData);
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codeSent) {
      toast.error('Você precisa enviar e verificar o código primeiro');
      return;
    }

    if (!formData.verificationCode) {
      toast.error('Digite o código de verificação');
      return;
    }

    await verifyCode();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Criar Conta</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Junte-se ao FlashConCards</p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="seu@email.com"
                />
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sendingCode || !formData.email}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{sendingCode ? 'Enviando...' : 'Enviar Código'}</span>
                </button>
              </div>
              {codeSent && (
                <p className="mt-1 text-sm text-green-600">
                  ✅ Código enviado! Verifique seu email.
                </p>
              )}
            </div>

            {codeSent && (
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Código de Verificação
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    value={formData.verificationCode}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Digite o código de 6 dígitos"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={verifyingCode || !formData.verificationCode}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingCode ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 