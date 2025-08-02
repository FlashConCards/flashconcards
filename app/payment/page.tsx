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
              // Pagamento pendente, aguardar
              toast.success('Pagamento em processamento...');
              setTimeout(() => {
                router.push('/payment/pending');
              }, 2000);
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

  return null;
} 