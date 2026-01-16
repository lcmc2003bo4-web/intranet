import { PrismaClient, Role, PaymentStatus, GradeType, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create Parent
    const parent = await prisma.user.create({
        data: {
            name: 'Juan Perez',
            email: 'juan.perez@example.com',
            role: Role.PARENT,
            phone: '555-0123',
        },
    });

    // 2. Create Student
    const studentUser = await prisma.user.create({
        data: {
            name: 'Carlitos Perez',
            email: 'carlitos@example.com',
            role: Role.STUDENT,
        },
    });

    const student = await prisma.student.create({
        data: {
            id: studentUser.id,
            parentId: parent.id,
            gradeLevel: '5th Grade',
            section: 'A',
        },
    });

    // 3. Create Pensions
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    // Overdue Pension
    await prisma.pensionPlan.create({
        data: {
            studentId: student.id,
            amount: 500.00,
            dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 5), // Last month
            billingPeriodStart: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            billingPeriodEnd: new Date(today.getFullYear(), today.getMonth(), 0),
            status: PaymentStatus.OVERDUE,
        },
    });

    // Due Soon Pension
    await prisma.pensionPlan.create({
        data: {
            studentId: student.id,
            amount: 500.00,
            dueDate: new Date(today.getFullYear(), today.getMonth(), 5), // This month (expired if today > 5)
            billingPeriodStart: new Date(today.getFullYear(), today.getMonth(), 1),
            billingPeriodEnd: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            status: PaymentStatus.PENDING,
        },
    });

    // Future Pension
    await prisma.pensionPlan.create({
        data: {
            studentId: student.id,
            amount: 500.00,
            dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5),
            billingPeriodStart: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
            billingPeriodEnd: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0),
            status: PaymentStatus.PENDING,
        },
    });

    console.log(`Seeding finished. created student: ${student.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
