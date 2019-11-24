import { getId } from '../database';
import { reThrowError } from '../utils/error-encoder';
import { ERROR_DATABASE } from '../errors';

export const buildMappingsService = (mappingCollection) => {
    const getMappings = async () => {
        try {
            return await mappingCollection.find({}).toArray();
        }
        catch (error) {
            return void reThrowError(ERROR_DATABASE.type, error);
        }
    };

    const getMappingById = async (id) => {
        try {
            return mappingCollection.findOne({_id: getId(id)});
        }
        catch (error) {
            return void reThrowError(ERROR_DATABASE.type, error);
        }
    };

    return {
        getMappings,
        getMappingById
    };
};

export default buildMappingsService;
