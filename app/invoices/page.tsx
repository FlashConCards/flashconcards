'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { getInvoicesByUserId } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadInvoices = async () => {
      try {
        setLoading(true);
        const userInvoices = await getInvoicesByUserId(user.uid);
        setInvoices(userInvoices);
      } catch (error) {
        console.error('Erro ao carregar notas fiscais:', error);
        toast.error('Erro ao carregar notas fiscais');
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [user, router]);

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const downloadInvoice = async (invoice: any) => {
    try {
      // Aqui você pode implementar o download da nota fiscal em PDF
      toast.success('Download iniciado');
    } catch (error) {
      console.error('Erro ao baixar nota fiscal:', error);
      toast.error('Erro ao baixar nota fiscal');
    }
  };

  const resendInvoiceEmail = async (invoice: any) => {
    try {
      const response = await fetch('/api/invoice/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Nota fiscal reenviada por email!');
      } else {
        toast.error(data.error || 'Erro ao reenviar nota fiscal');
      }
    } catch (error) {
      console.error('Erro ao reenviar nota fiscal:', error);
      toast.error('Erro ao reenviar nota fiscal');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minhas Notas Fiscais
          </h1>
          <p className="text-gray-600">
            Visualize e baixe suas notas fiscais
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notas fiscais...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma nota fiscal encontrada
            </h3>
            <p className="text-gray-600">
              Suas notas fiscais aparecerão aqui após pagamentos aprovados.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Notas Fiscais ({invoices.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {invoice.courseName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(invoice.issueDate)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            {formatCurrency(invoice.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                                         <div className="flex items-center space-x-2">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                         invoice.status === 'issued' 
                           ? 'bg-green-100 text-green-800' 
                           : 'bg-gray-100 text-gray-800'
                       }`}>
                         {invoice.status === 'issued' ? 'Emitida' : invoice.status}
                       </span>
                       <button
                         onClick={() => resendInvoiceEmail(invoice)}
                         className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                         title="Reenviar nota fiscal por email"
                       >
                         <EnvelopeIcon className="w-5 h-5" />
                       </button>
                       <button
                         onClick={() => downloadInvoice(invoice)}
                         className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                         title="Baixar nota fiscal"
                       >
                         <ArrowDownTrayIcon className="w-5 h-5" />
                       </button>
                       <button
                         onClick={() => window.open(`/invoices/${invoice.id}`, '_blank')}
                         className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                         title="Visualizar nota fiscal"
                       >
                         <EyeIcon className="w-5 h-5" />
                       </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 