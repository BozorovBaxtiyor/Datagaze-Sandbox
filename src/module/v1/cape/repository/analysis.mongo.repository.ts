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
        return this.analysisCollection.findOne(
            { 'info.id': Number(taskId) },
            {
                projection: {
                    info: 1,
                    'debug.log':1,
                    'target.file': 1,
                    signatures:1,
                },
            },
        );
    }
}
