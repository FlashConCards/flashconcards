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

    // Redirecionar para o Mercado Pago
    const redirectToMercadoPago = async () => {
      try {
        setLoading(true);
        
        // Buscar informações do pagamento
        const response = await fetch(`/api/payment/get-preference/${paymentId}`);
        const data = await response.json();

        if (response.ok && data.initPoint) {
          // Redirecionar para o Mercado Pago
          window.location.href = data.initPoint;
        } else {
          setError('Erro ao obter link de pagamento');
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        setError('Erro ao processar pagamento');
        setLoading(false);
      }
    };

    redirectToMercadoPago();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {method === 'pix' ? 'Preparando PIX...' : 'Preparando cartão de crédito...'}
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