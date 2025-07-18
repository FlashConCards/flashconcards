export interface UserData {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  joinedAt: Date;
  passedExam?: boolean;
  examDate?: Date;
  feedback?: {
    rating: number;
    comment: string;
    date: Date;
  };
}

// Dados reais dos usuários (simulando um banco de dados)
export const usersData: UserData[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    isActive: true,
    joinedAt: new Date('2023-01-15'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    isActive: true,
    joinedAt: new Date('2023-02-20'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    isActive: true,
    joinedAt: new Date('2023-03-10'),
    passedExam: false,
    examDate: new Date('2023-06-15')
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    isActive: true,
    joinedAt: new Date('2023-01-30'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  },
  {
    id: '5',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    isActive: true,
    joinedAt: new Date('2023-02-15'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  },
  {
    id: '6',
    name: 'Roberto Almeida',
    email: 'roberto.almeida@email.com',
    isActive: false,
    joinedAt: new Date('2023-01-10'),
    passedExam: false,
    examDate: new Date('2023-06-15')
  },
  {
    id: '7',
    name: 'Patrícia Souza',
    email: 'patricia.souza@email.com',
    isActive: true,
    joinedAt: new Date('2023-03-05'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  },
  {
    id: '8',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@email.com',
    isActive: true,
    joinedAt: new Date('2023-02-25'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  },
  {
    id: '9',
    name: 'Juliana Ferreira',
    email: 'juliana.ferreira@email.com',
    isActive: true,
    joinedAt: new Date('2023-01-20'),
    passedExam: false,
    examDate: new Date('2023-06-15')
  },
  {
    id: '10',
    name: 'Marcos Rodrigues',
    email: 'marcos.rodrigues@email.com',
    isActive: true,
    joinedAt: new Date('2023-03-01'),
    passedExam: true,
    examDate: new Date('2023-06-15')
  }
];

// Funções para calcular estatísticas reais
export function getApprovalRate(): number {
  const usersWhoTookExam = usersData.filter(user => user.passedExam !== undefined);
  const usersWhoPassed = usersWhoTookExam.filter(user => user.passedExam === true);
  
  if (usersWhoTookExam.length === 0) return 0;
  return Math.round((usersWhoPassed.length / usersWhoTookExam.length) * 100);
}

export function getActiveStudents(): number {
  return usersData.filter(user => user.isActive).length;
}

export function getTotalStudents(): number {
  return usersData.length;
}

export function getRealTestimonials() {
  return usersData
    .filter(user => user.feedback)
    .map(user => ({
      name: user.name,
      role: user.passedExam ? 'Aprovado(a)' : 'Candidato(a)',
      content: user.feedback!.comment,
      rating: user.feedback!.rating,
      date: user.feedback!.date
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6); // Retorna os 6 feedbacks mais recentes
}

// Função para adicionar novo usuário
export function addUser(userData: Omit<UserData, 'id'>): UserData {
  const newUser: UserData = {
    ...userData,
    id: (usersData.length + 1).toString()
  };
  usersData.push(newUser);
  return newUser;
}

// Função para atualizar status de aprovação
export function updateUserApprovalStatus(userId: string, passed: boolean, examDate?: Date): void {
  const user = usersData.find(u => u.id === userId);
  if (user) {
    user.passedExam = passed;
    if (examDate) user.examDate = examDate;
  }
}

// Função para adicionar feedback
export function addUserFeedback(userId: string, rating: number, comment: string): void {
  const user = usersData.find(u => u.id === userId);
  if (user) {
    user.feedback = {
      rating,
      comment,
      date: new Date()
    };
  }
} 