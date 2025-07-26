import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Inicializar Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: "flashconcards-12244",
        clientEmail: "firebase-adminsdk-fbsvc@flashconcards-12244.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD21TU2QpwkWpCQ\n3KpLn9xBwArNZfQcQiZj6+hsqn44KoPXKQZZ87+B0XUWyn4+YgN9BlHiLQT8LolH\n/0lR6Dq6dkL95EWp5/aK3BLKzcK+OYgYnlNfkljuhi4TwhK7hJJyTmZZ2ERyzbHr\nUBcaZb/YEDBmG2CHwOVqRZnR007OJSPo3t6+Iutrd7vn/QtDOYhJkZfY1EHfKLCp\nHGcpT8vevtWTajALw891sSNqgvf5eQalkFkgX61rNns2Xw0P9Xn5qwym/Cv03+7A\nF6MzeVJLoSYVUlFKAz5wz96mJd82XUP0YINO+nw5qaRYG8O3wB/WvtAFuoI3mSGq\n30orbDFTAgMBAAECggEAZRQTWdh2I4b4u3G5xQU+R6iSY+FT0Tyfhvykrdc1n999\nJN92a+CetFUna0FZ6Ebv4cN0Rbgk2fZenl6i0klUv2XNcjYH9xd4BQ4xHd6b2JUr\nr9UqFDGUfHzzIoEvdZ3I8Mk9LZ6cDR1BtjiSdWtkX+DlSPL+GSl7aQT+hAfRtiV+\nh9G4zpPXENkPaBQS7uhuv2V6BAWYongghBzcdyBPhVLEqvhEFufha3dkSGwbvh3u\nBWXiyeq81RdImpbhOEGSCeikL6U+gtKNZUGtOLGkRN1Lg9RhZV2/4C/U+eeULooh\nFaZoYeNPqmcb5Nucw7ilrgL+gVLTbpPRhC89i7e98QKBgQD9S+5nV/DtyEcAVP/q\nJZI1sL3R2K9HV5O1JLeBYqlaA/8tVeK421aoO42evJ1B0X19lZXqqYP75dnN/Tg4\nAHz9nWJH42WRrTfFD2Q5oyU2zUHqqfMevW+htzeoJ/1zFUf9w8JkMumHizcYB6i7\n7yfKIvdXGEBoa9BgRAQeO/le4wKBgQD5d52yPKvL2PDZLApdTTh3BdrJDZL6yVra\nRZdbiKFkesyI5x8qsfXFWZmM1jlY01Ux5JT6lTwJ5BAifaaPUf8zY16zz4gaH8/0\n/80odRKNPXbI52Iay4DXlddA+7trrz41irjb1XKuZF7d1Xz6cezvp1f1MoG6vLSh\n3b3drvZ+0QKBgQCS8+ieoFCxQ46dzLKkn6OR7rZR9srKMy8I2wJz2E+0X7k+DiP5\nZ5eBBvwE6hy6QNXzdEOD31EpZZLVhWGGbBIX+aU5W95jhAFlHKbjIZnHj5H8mRjp\n7rHDOs7Ziknq6J/ZxCcVhswhzUzrbhYg4oFNLrgdGX7UlihQkWVqPRVSTQKBgQCK\neSUlvJu36VG3msSeCbEgEDXjiA9f+cjeg+aCPpMnjSpfi7s3HdVImHWtQXRPo+8U\nZMd1WMUc0GVMX+bGg0NfKPd2Y+ouZh4u5pbgsCt+DvISjq1cJj38bQYw4gqkuX+U\nhM4b6J1hxAEMreZTtk1IseEXD9QG7ZxuhQFRPj9BIQKBgQCSjfoFU1eRo+N57G/D\nEH8zGrdED5o08pfRuGCmSQENzdXC0g8NsVmmVbVYiynJRp0l35Gio8zp8J4aZSFS\n7iNv7r5NDOUUL61R7YUb2PKrwpiZHDTadOk8ABOLqeAqf3p+d2AVuInQ/UVvheuX\noHs5rCtkG6cYkht2mToTzkYVgQ==\n-----END PRIVATE KEY-----\n"
      })
    });
    console.log('Firebase Admin SDK inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin SDK:', error);
  }
}

export async function POST() {
  try {
    console.log('Iniciando criação do usuário admin...');
    
    const auth = getAuth();
    
    // Verificar se o usuário já existe
    try {
      console.log('Verificando se usuário já existe...');
      const userRecord = await auth.getUserByEmail('claudioghabryel7@gmail.com');
      console.log('Usuário já existe:', userRecord.uid);
      return NextResponse.json({
        success: true,
        message: 'Usuário admin já existe',
        uid: userRecord.uid
      });
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        console.error('Erro ao verificar usuário:', error);
        throw error;
      }
      console.log('Usuário não encontrado, criando novo...');
    }

    // Criar usuário admin
    console.log('Criando novo usuário admin...');
    const userRecord = await auth.createUser({
      email: 'claudioghabryel7@gmail.com',
      password: 'Gabriel@123',
      displayName: 'Admin FlashConCards',
      emailVerified: true
    });

    console.log('Usuário criado com sucesso:', userRecord.uid);
    return NextResponse.json({
      success: true,
      message: 'Usuário admin criado com sucesso',
      uid: userRecord.uid
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário admin:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
} 