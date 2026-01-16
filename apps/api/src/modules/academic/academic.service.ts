
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface StudentRiskProfile {
    studentId: string;
    name: string;
    gradeLevel: string;
    average: number;
    riskStatus: 'RED' | 'YELLOW' | 'GREEN';
    riskLabel: string;
}

@Injectable()
export class AcademicService {
    private readonly logger = new Logger(AcademicService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getRiskReport(): Promise<StudentRiskProfile[]> {
        // Fetch all students with their enrollments and grades
        const students = await this.prisma.student.findMany({
            include: {
                user: {
                    select: { name: true }
                },
                enrollments: {
                    include: {
                        grades: true
                    }
                }
            }
        });

        const report: StudentRiskProfile[] = students.map(student => {
            let totalWeightedScore = 0;
            let totalWeight = 0;

            // Calculate weighted average across all subjects/enrollments
            student.enrollments.forEach(enrollment => {
                enrollment.grades.forEach(grade => {
                    const value = Number(grade.value);
                    const weight = Number(grade.weight);

                    totalWeightedScore += value * weight;
                    totalWeight += weight;
                });
            });

            const average = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
            const formattedAverage = parseFloat(average.toFixed(2));

            let riskStatus: 'RED' | 'YELLOW' | 'GREEN';

            if (formattedAverage < 11) {
                riskStatus = 'RED';
            } else if (formattedAverage <= 13) {
                riskStatus = 'YELLOW';
            } else {
                riskStatus = 'GREEN';
            }

            return {
                studentId: student.id,
                name: student.user.name,
                gradeLevel: student.gradeLevel,
                average: formattedAverage,
                riskStatus,
                riskLabel: riskStatus === 'RED' ? 'CRITICO' : riskStatus === 'YELLOW' ? 'RIESGO MODERADO' : 'SATISFACTORIO'
            };
        });

        // Sort by risk severity: RED first, then YELLOW, then GREEN
        const riskOrder = { 'RED': 0, 'YELLOW': 1, 'GREEN': 2 };
        return report.sort((a, b) => riskOrder[a.riskStatus] - riskOrder[b.riskStatus]);
    }
}
