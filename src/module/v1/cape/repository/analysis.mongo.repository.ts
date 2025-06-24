import { Inject, Injectable } from "@nestjs/common";
import { Collection, Db } from "mongodb";
import { AnalysisDocument} from '../../../../database/mongo/models/analysis.schema'
import { info } from "console";

Injectable()
export class CapeAnalysisMongoRepository {
    private readonly analysisCollection: Collection<AnalysisDocument>;

    constructor(@Inject('MONGO_CONNECTION') private readonly db: Db) {
        this.analysisCollection = this.db.collection<AnalysisDocument>('analysis');
    }

    async getAnalysisById(taskId: number): Promise<AnalysisDocument | null> {
        const piplene = [
            {
                $match: { 'info.id': taskId },
            },
            {
                $lookup: {
                    from: 'files',
                    localField: 'target.file.file_ref',
                    foreignField: '_id',
                    as: 'target.file2',
                },
            },
            {
                $unwind: { path: '$target.file2', preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    info: 1,
                    'debug.log': 1,
                    'target.file': 1,
                    signatures: 1,
                    'target.file2.sha3_384': 1,
                    'target.file2.tlsh': 1,
                },
            },
        ];


        const result = await this.analysisCollection.aggregate(piplene).toArray();
        return result.length > 0 ? (result[0] as AnalysisDocument) : null;
    }
}
