import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';
import { CapeDatabaseRepository } from '../cape.database.repository';
import { TaskListQueryDto } from '../../dto/tasks.list.query.dto';

// Knex query builder'ni mock qilish uchun yordamchi funksiya
const mockKnex = () => {
    const mockQueryBuilder = {
        whereIn: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        // `await` qilinganda soxta ma'lumotni qaytarish uchun
        then: jest.fn(function (resolve) {
            resolve([]);
        }),
    };
    return jest.fn(() => mockQueryBuilder);
};

describe('CapeDatabaseRepository', () => {
    let repository: CapeDatabaseRepository;
    let knex: Knex;
    let queryBuilder: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CapeDatabaseRepository,
                {
                    provide: 'KNEX_SECONDARY',
                    useValue: mockKnex(), // Soxta knex instansiyasini ishlatamiz
                },
            ],
        }).compile();

        repository = module.get<CapeDatabaseRepository>(CapeDatabaseRepository);
        knex = module.get<Knex>('KNEX_SECONDARY');
        
        queryBuilder = (knex as any)(); // mockKnex() funksiyasidan mockQueryBuilder'ni olamiz
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('getTotalTasks', () => {
        const mockQuery: TaskListQueryDto = { page: 1, limit: 10 };
        const mockTasks = [{ id: 1, status: 'pending', target: 'file.exe' }];

        it('should correctly build query for "active" path', async () => {
            // `await` qilinganda mockTasks'ni qaytarishni sozlaymiz
            queryBuilder.then.mockImplementationOnce(resolve => resolve(mockTasks));

            const result = await repository.getTotalTasks(mockQuery, 'active');

            // 1. Knex to'g'ri jadval bilan chaqirilganini tekshirish
            expect(knex).toHaveBeenCalledWith('tasks');

            // 2. `whereIn` to'g'ri statuslar bilan chaqirilganini tekshirish
            expect(queryBuilder.whereIn).toHaveBeenCalledWith('tasks.status', [
                'pending',
                'running',
                'distributed',
            ]);

            // 3. `leftJoin` va `select` chaqirilganini tekshirish
            expect(queryBuilder.leftJoin).toHaveBeenCalledTimes(2);
            expect(queryBuilder.select).toHaveBeenCalled();

            // 4. Pagination to'g'ri ishlaganini tekshirish
            expect(queryBuilder.limit).toHaveBeenCalledWith(10);
            expect(queryBuilder.offset).toHaveBeenCalledWith(0);

            // 5. Natija to'g'ri formatda qaytganini tekshirish
            expect(result).toEqual({ data: mockTasks });
        });

        it('should correctly build query for "history" path', async () => {
            queryBuilder.then.mockImplementationOnce(resolve => resolve(mockTasks));

            await repository.getTotalTasks(mockQuery, 'history');

            // `whereIn` "history" uchun to'g'ri statuslar bilan chaqirilganini tekshirish
            expect(queryBuilder.whereIn).toHaveBeenCalledWith('tasks.status', [
                'reported',
                'failed_reporting',
            ]);
        });

        it('should handle different page and limit values', async () => {
            const customQuery: TaskListQueryDto = { page: 3, limit: 5 };
            queryBuilder.then.mockImplementationOnce(resolve => resolve([]));

            await repository.getTotalTasks(customQuery, 'active');

            // Pagination qiymatlari to'g'ri hisoblanganini tekshirish
            expect(queryBuilder.limit).toHaveBeenCalledWith(5);
            expect(queryBuilder.offset).toHaveBeenCalledWith(10); // (3 - 1) * 5 = 10
        });
    });
});
