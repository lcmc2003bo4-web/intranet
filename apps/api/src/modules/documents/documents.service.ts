
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class DocumentsService {
    constructor(private readonly prisma: PrismaService) { }

    async generateReportCard(studentId: string): Promise<Buffer> {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: true,
                enrollments: {
                    include: {
                        subject: true,
                        grades: true
                    }
                }
            }
        });

        if (!student) {
            throw new Error('Student not found');
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Header
            doc.fontSize(20).text('Boletín de Notas', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Estudiante: ${student.user.name}`);
            doc.text(`Grado: ${student.gradeLevel}`);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
            doc.moveDown();

            // Table Header
            doc.fontSize(10);
            doc.text('Materia', 50, doc.y, { continued: true });
            doc.text('Promedio', 300, doc.y, { align: 'right' });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            let totalWeightedScore = 0;
            let totalWeight = 0;

            // Grades Rows
            student.enrollments.forEach(enrollment => {
                let subjectTotal = 0;
                let subjectWeight = 0;

                enrollment.grades.forEach(grade => {
                    subjectTotal += Number(grade.value) * Number(grade.weight);
                    subjectWeight += Number(grade.weight);
                });

                const subjectAvg = subjectWeight > 0 ? (subjectTotal / subjectWeight).toFixed(2) : 'N/A';

                doc.text(enrollment.subject.name, 50, doc.y, { continued: true });
                doc.text(subjectAvg, 300, doc.y, { align: 'right' });
                doc.moveDown();

                // Accumulate for global average
                if (subjectWeight > 0) {
                    totalWeightedScore += Number(subjectTotal);
                    totalWeight += Number(subjectWeight);
                }
            });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Overall Average
            const globalAvg = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : '0.00';
            let riskStatus = 'VERDE';
            if (Number(globalAvg) < 11) riskStatus = 'ROJO (CRITICO)';
            else if (Number(globalAvg) <= 13) riskStatus = 'AMARILLO (RIESGO)';

            doc.fontSize(12).text(`Promedio General: ${globalAvg}`, { align: 'right' });
            doc.text(`Estado de Riesgo: ${riskStatus}`, { align: 'right' });

            doc.end();
        });
    }
}
