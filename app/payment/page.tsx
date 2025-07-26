'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle,
  ArrowLeft,
  Shield,
  Clock,
  Loader2
} from 'lucide-react'
import PaymentStatus from '@/app/components/PaymentStatus'

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [isPixCopied, setIsPixCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [installments, setInstallments] = useState('1')
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  })

  const handlePixCopy = () => {
    if (pixData && pixData.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code)
      setIsPixCopied(true)
      setTimeout(() => setIsPixCopied(false), 2000)
    }
  }

  const createPixPayment = async () => {
    if (!userData.email || !userData.firstName || !userData.lastName) {
      alert('Por favor, preencha todos os dados pessoais')
      return
    }

    setIsLoading(true)
    try {
      // Usar a API real do Mercado Pago para que o dinheiro caia na conta
      const response = await fetch('/api/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      })

      const data = await response.json()

      if (data.success) {
        setPixData(data)
        setIsPixCopied(false) // Reset copied state
      } else {
        alert('Erro ao gerar PIX: ' + data.error)
      }
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error)
      alert('Erro ao processar pagamento PIX')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userData.email || !userData.firstName || !userData.lastName) {
      alert('Por favor, preencha todos os dados pessoais')
      return
    }

    setIsLoading(true)
    try {
      // Aqui você precisaria implementar a tokenização do cartão com Mercado Pago
      // Por enquanto, vamos simular
      const response = await fetch('/api/payment/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          token: 'fake_token', // Em produção, seria o token real do cartão
          paymentMethodId: 'visa', // Seria determinado pelo tipo de cartão
          installments: installments,
          issuerId: null
        }),
      })

      const result = await response.json()

      if (result.success) {
        window.location.href = '/payment/success'
      } else {
        alert('Erro ao processar pagamento: ' + result.error)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      alert('Erro ao processar pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Finalizar Compra
                </h1>
                <p className="text-sm text-gray-600">
                  Acesso completo aos FlashConCards ALEGO
                </p>
              </div>
            </div>
                          <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">FlashConCards</span>
              </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
            
                      <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Acesso aos FlashConCards ALEGO</span>
              <span className="font-medium">R$ 99,90</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Acesso por 12 meses</span>
              <span className="text-green-600 font-medium">Incluído</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Atualizações gratuitas</span>
              <span className="text-green-600 font-medium">Incluído</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Suporte especializado</span>
              <span className="text-green-600 font-medium">Incluído</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Desconto especial</span>
              <span className="text-red-600 font-medium">-R$ 300,00</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total PIX</span>
              <span className="text-2xl font-bold text-primary-600">R$ 99,90</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-bold text-gray-900">Total Cartão</span>
              <span className="text-2xl font-bold text-green-600">R$ 99,90</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Economia de 75% no valor total
            </div>
          </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Pagamento 100% seguro e criptografado
                </span>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Dados Pessoais</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Seu sobrenome"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">Forma de Pagamento</h2>

            {/* Payment Method Tabs */}
                         <div className="flex space-x-2 mb-6">
               <button
                 onClick={() => setPaymentMethod('pix')}
                 className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                   paymentMethod === 'pix'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 <QrCode className="h-5 w-5 inline mr-2" />
                 PIX
                 <span className="text-xs ml-1">R$ 99,90</span>
               </button>
               <button
                 onClick={() => setPaymentMethod('card')}
                 className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                   paymentMethod === 'card'
                     ? 'bg-primary-600 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 <CreditCard className="h-5 w-5 inline mr-2" />
                 Cartão
                 <span className="text-xs ml-1">até 12x</span>
               </button>
             </div>

            {/* PIX Payment */}
            {paymentMethod === 'pix' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-6 mb-4">
                                         {/* QR CODE FIXO - SEMPRE APARECE */}
                     <div className="text-center mb-4">
                       <div className="bg-white rounded-lg p-4 inline-block border-2 border-blue-200">
                         <div className="text-2xl font-bold text-blue-600 mb-2">PIX</div>
                         <div className="text-sm text-gray-600">R$ 99,90</div>
                         <div className="text-xs text-gray-500 mt-1">QR Code disponível</div>
                       </div>
                     </div>
                     {/* QR CODE FIXO - IMAGEM */}
                     <div className="flex justify-center mb-4">
                       <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                         <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                           <div className="text-center text-gray-500">
                             <QrCode className="h-32 w-32 mx-auto" />
                             <p className="text-xs mt-2">QR Code PIX</p>
                           </div>
                         </div>
                       </div>
                     </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Escaneie o QR Code com seu app bancário
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Código PIX:</span>
                        <button
                          onClick={handlePixCopy}
                          className="flex items-center text-blue-600 hover:text-blue-700 bg-blue-100 px-3 py-1 rounded-lg"
                        >
                          {isPixCopied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                                               <div className="bg-white p-3 rounded border text-sm font-mono text-gray-800 break-all">
                           {pixData && pixData.qr_code ? pixData.qr_code : 'Código PIX será gerado aqui...'}
                         </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <p>• Pague com PIX e tenha acesso imediato</p>
                      <p>• Aprovação em até 2 minutos</p>
                      <p>• Pagamento 100% seguro</p>
                    </div>
                    
                    {pixData.payment_id && (
                      <PaymentStatus 
                        paymentId={pixData.payment_id}
                        onSuccess={() => window.location.href = '/payment/success'}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Card Payment */}
            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({...cardData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nome como está no cartão"
                    />
                  </div>

                                     <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Validade
                       </label>
                       <input
                         type="text"
                         value={cardData.expiry}
                         onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                         placeholder="MM/AA"
                         maxLength={5}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         CVV
                       </label>
                       <input
                         type="text"
                         value={cardData.cvv}
                         onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                         placeholder="123"
                         maxLength={4}
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Parcelamento
                     </label>
                     <select
                       value={installments}
                       onChange={(e) => setInstallments(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     >
                       <option value="1">1x de R$ 99,90 sem juros</option>
                       <option value="2">2x de R$ 49,95 sem juros</option>
                       <option value="3">3x de R$ 33,30 sem juros</option>
                       <option value="6">6x de R$ 16,65 sem juros</option>
                       <option value="12">12x de R$ 8,33 sem juros</option>
                     </select>
                   </div>

                                     <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full btn-primary py-3 flex items-center justify-center"
                   >
                     {isLoading ? (
                       <>
                         <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                         Processando...
                       </>
                     ) : (
                                            `Pagar ${installments === '1' ? 'R$ 99,90' : 
                            installments === '2' ? '2x de R$ 49,95' :
                            installments === '3' ? '3x de R$ 33,30' :
                            installments === '6' ? '6x de R$ 16,65' :
                            '12x de R$ 8,33'}`
                     )}
                   </button>
                </form>

                                 <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                   <Shield className="h-4 w-4 mr-2" />
                   Pagamento seguro com criptografia SSL
                 </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">O que você recebe:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">500+ FlashConCards</h4>
                  <p className="text-sm text-gray-600">Organizados por matéria</p>
                </div>
              </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Acesso por 12 meses</h4>
                <p className="text-sm text-gray-600">Estude no seu ritmo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Suporte especializado</h4>
                <p className="text-sm text-gray-600">Tire suas dúvidas</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 