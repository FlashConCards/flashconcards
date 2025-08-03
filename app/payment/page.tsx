'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CreditCardIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const paymentId = searchParams.get('paymentId');
  const method = searchParams.get('method');

  useEffect(() => {
    if (!paymentId) {
      setError('ID do pagamento não encontrado');
      setLoading(false);
      return;
    }

    // Processar pagamento usando o novo endpoint
    const processPayment = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Verificando status do pagamento:', { paymentId, method });
        
        // Usar o novo endpoint que verifica tanto pagamentos quanto preferências
        const response = await fetch(`/api/payment/get-status/${paymentId}`);
        const data = await response.json();

        console.log('📦 Resposta do servidor:', data);

        if (response.ok && data.success) {
          if (data.type === 'payment') {
            // É um pagamento direto (PIX)
            console.log('✅ Pagamento PIX encontrado:', data.status);
            
            if (data.status === 'approved') {
              // Pagamento aprovado, redirecionar para sucesso
              toast.success('Pagamento aprovado!');
              router.push('/payment/success');
            } else if (data.status === 'pending') {
              // Pagamento pendente, mostrar QR code se for PIX
              if (data.payment_method_id === 'pix') {
                setPaymentData(data);
                setLoading(false);
              } else {
                toast.success('Pagamento em processamento...');
                setTimeout(() => {
                  router.push('/payment/pending');
                }, 2000);
              }
            } else {
              // Outro status
              setError(`Status do pagamento: ${data.status}`);
              setLoading(false);
            }
          } else if (data.type === 'preference') {
            // É uma preferência (cartão)
            console.log('✅ Preferência encontrada, redirecionando...');
            
            if (data.initPoint) {
              // Redirecionar para o Mercado Pago
              window.location.href = data.initPoint;
            } else {
              setError('Link de pagamento não disponível');
              setLoading(false);
            }
          }
        } else {
          console.error('❌ Erro na resposta:', data);
          setError(data.error || 'Erro ao verificar pagamento');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro ao processar pagamento:', error);
        setError('Erro ao processar pagamento');
        setLoading(false);
      }
    };

    processPayment();
  }, [paymentId, method, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {method === 'pix' ? 'Verificando PIX...' : 'Verificando pagamento...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro no Pagamento</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/course-selection')}
            className="btn-primary"
          >
            Voltar aos Cursos
          </button>
        </div>
      </div>
    );
  }

  // Renderizar QR code para pagamento PIX pendente
  if (paymentData && paymentData.payment_method_id === 'pix' && paymentData.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="w-8 h-8 text-blue-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Pagamento PIX
              </h1>
              
              <p className="text-gray-600 mb-6">
                Escaneie o QR code abaixo para realizar o pagamento
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>ID do Pagamento:</strong> {paymentId}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Status:</strong> 
                  <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Pendente
                  </span>
                </div>
                {paymentData.transaction_amount && (
                  <div className="text-sm text-gray-600">
                    <strong>Valor:</strong> R$ {paymentData.transaction_amount.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>

              {/* QR Code placeholder - você precisará implementar a geração real do QR code */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-6">
                <div className="text-center">
                  <QrCodeIcon className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    QR Code do PIX será gerado aqui
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    (Implementar geração do QR code)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/payment/pending')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Verificar Status
                </button>

                <button
                  onClick={() => router.push('/course-selection')}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Voltar aos Cursos
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>• Use o app do seu banco para escanear o QR code</p>
                <p>• O pagamento pode levar alguns minutos para ser confirmado</p>
                <p>• Você receberá um email quando o pagamento for aprovado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 