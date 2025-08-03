'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!paymentId) {
      toast.error('ID do pagamento não encontrado');
      router.push('/course-selection');
      return;
    }

    // Carregar dados do pagamento e gerar nota fiscal
    const loadPaymentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment/get-status/${paymentId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPaymentData(data);
          
          // Gerar nota fiscal automaticamente se o pagamento foi aprovado
          if (data.status === 'approved') {
            try {
              const invoiceResponse = await fetch('/api/invoice/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentId: paymentId,
                  userId: data.external_reference?.split('_')[0] || '',
                  courseId: data.external_reference?.split('_')[1] || '',
                  courseName: data.description || 'Curso FlashConCards',
                  amount: data.transaction_amount || 0
                })
              });

              const invoiceData = await invoiceResponse.json();
              if (invoiceData.success) {
                console.log('✅ Nota fiscal gerada:', invoiceData.invoiceNumber);
              }
            } catch (error) {
              console.error('Erro ao gerar nota fiscal:', error);
            }
          }
        } else {
          toast.error(data.error || 'Erro ao carregar dados do pagamento');
        }
      } catch (error) {
        console.error('Erro ao carregar pagamento:', error);
        toast.error('Erro ao carregar dados do pagamento');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [paymentId, router]);

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Aprovado!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Seu pagamento foi processado com sucesso. Você já pode acessar o curso.
            </p>

            {paymentData && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>ID do Pagamento:</strong> {paymentId}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Status:</strong> 
                  <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Aprovado
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
                onClick={goToDashboard}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Acessar Dashboard
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push('/course-selection')}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Ver Mais Cursos
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>• Você receberá um email de confirmação</p>
              <p>• O acesso ao curso está ativo imediatamente</p>
              <p>• Em caso de dúvidas, entre em contato conosco</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 