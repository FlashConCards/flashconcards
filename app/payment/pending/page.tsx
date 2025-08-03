'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!paymentId) {
      toast.error('ID do pagamento não encontrado');
      router.push('/course-selection');
      return;
    }

    // Carregar dados do pagamento
    const loadPaymentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment/get-status/${paymentId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPaymentData(data);
        } else {
          toast.error(data.error || 'Erro ao carregar dados do pagamento');
          router.push('/course-selection');
        }
      } catch (error) {
        console.error('Erro ao carregar pagamento:', error);
        toast.error('Erro ao carregar dados do pagamento');
        router.push('/course-selection');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [paymentId, router]);

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      const response = await fetch(`/api/payment/get-status/${paymentId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.status === 'approved') {
          toast.success('Pagamento aprovado!');
          router.push('/payment/success');
                 } else if (data.status === 'pending') {
           toast.success('Pagamento ainda em processamento...');
           setPaymentData(data);
        } else {
          toast.error(`Status do pagamento: ${data.status}`);
        }
      } else {
        toast.error(data.error || 'Erro ao verificar pagamento');
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast.error('Erro ao verificar pagamento');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento em Processamento
            </h1>
            
            <p className="text-gray-600 mb-6">
              Seu pagamento está sendo processado. Isso pode levar alguns minutos.
            </p>

            {paymentData && (
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
                {paymentData.amount && (
                  <div className="text-sm text-gray-600">
                    <strong>Valor:</strong> R$ {paymentData.amount.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={checkPaymentStatus}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Verificando...' : 'Verificar Status'}
              </button>

              <button
                onClick={() => router.push('/course-selection')}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Voltar aos Cursos
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>• O pagamento pode levar até 30 minutos para ser confirmado</p>
              <p>• Você receberá um email quando o pagamento for aprovado</p>
              <p>• Em caso de dúvidas, entre em contato conosco</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 