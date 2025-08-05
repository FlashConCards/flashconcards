import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    // Verificar se é um webhook do MercadoPago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      // Buscar informações do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });

      if (!paymentResponse.ok) {
        console.error('Erro ao buscar pagamento:', paymentResponse.statusText);
        return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 400 });
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment data:', paymentData);

      // Verificar se o pagamento foi aprovado
      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference;
        const courseId = paymentData.description;

        if (userId && courseId) {
          try {
            // Atualizar o status do pagamento no Firebase
            const paymentRef = doc(db, 'payments', paymentId);
            await updateDoc(paymentRef, {
              status: 'approved',
              updatedAt: new Date()
            });

            // Atualizar o usuário para dar acesso ao curso
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const currentCourses = userData.selectedCourses || [];
              
              // Adicionar o curso se não estiver na lista
              if (!currentCourses.includes(courseId)) {
                await updateDoc(userRef, {
                  selectedCourses: [...currentCourses, courseId],
                  isPaid: true,
                  lastPaymentAt: new Date()
                });
              }
            }

            console.log(`Pagamento aprovado e acesso liberado para usuário ${userId} no curso ${courseId}`);
          } catch (error) {
            console.error('Erro ao atualizar dados do usuário:', error);
            return NextResponse.json({ error: 'Erro ao atualizar dados do usuário' }, { status: 500 });
          }
        }
      } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
        // Atualizar status para rejeitado/cancelado
        const paymentRef = doc(db, 'payments', paymentId);
        await updateDoc(paymentRef, {
          status: paymentData.status,
          updatedAt: new Date()
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 