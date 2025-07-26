'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowLeft, BookOpen, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Recuperar dados do usuário do localStorage ou sessionStorage
    const userData = JSON.parse(localStorage.getItem('flashconcards_user') || sessionStorage.getItem('flashconcards_user') || '{}');
    // Recuperar dados do último pagamento (idealmente salvos no localStorage/sessionStorage após o pagamento)
    const paymentInfo = JSON.parse(localStorage.getItem('flashconcards_last_payment') || sessionStorage.getItem('flashconcards_last_payment') || '{}');
    if (userData?.email && userData?.name && paymentInfo?.paymentId && !paymentInfo?.confirmationSent) {
      fetch('/api/email/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          paymentId: paymentInfo.paymentId,
          amount: paymentInfo.amount || '1,00'
        })
      }).then(() => {
        // Marcar como enviado para não disparar novamente
        paymentInfo.confirmationSent = true;
        localStorage.setItem('flashconcards_last_payment', JSON.stringify(paymentInfo));
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Parabéns! Seu pagamento foi processado com sucesso. 
          Agora você tem acesso completo ao FlashConCards para Policial Legislativo da ALEGO.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-semibold">Acesso Liberado</span>
          </div>
          <p className="text-green-700 text-sm">
            Você pode começar a estudar agora mesmo!
          </p>
        </div>

        {/* Credenciais de Acesso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Suas Credenciais de Acesso
          </h3>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                <strong>Email:</strong> Use o email do pagamento
              </span>
            </div>
            
            <div className="flex items-center">
              <Lock className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                <strong>Senha:</strong> souflashconcards
              </span>
            </div>
          </div>
          
          <p className="text-xs text-blue-600 mt-3">
            Guarde estas informações em local seguro!
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/login" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Acessar Sistema
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  )
} 