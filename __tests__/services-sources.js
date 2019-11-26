import { createDependencies } from '../src/dependencies';
import {
    buildSourcesService
} from '../src/services/sources';
import { typeOf } from '../src/utils/error-encoder';
import { ERROR_DATABASE } from '../src/errors';

describe.skip(
    'getsources should',
    () => {
        let dbClient, collection, service;
        beforeAll(
            async () => {
                const deps = await createDependencies({DBNAME: 'test-sources-service-all'});
                ({
                    dbClient,
                    sourcesCollection: collection,
                    sourcesService: service
                } = deps(['dbClient', 'sourcesCollection', 'sourcesService']));
            }
        );

        afterEach(
            async () => {
                await collection.deleteMany();
            }
        );

        afterAll(
            async () => {
                await dbClient.close();
            }
        );

        it(
            'return an empty array when no sources',
            async () => {
                const sources = await service.getSources();
                expect(sources).toEqual([]);
            }
        );

        it(
            'return an Error array when database fails',
            async () => {
                expect.assertions(1);
                const service = buildSourcesService({});

                try {
                    await service.getSources();
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return an array with all sources',
            async () => {
                const expectedsources = [
                    {
                        name: 'nameforsource1',
                        description: '',
                        template: ''
                    },
                    {
                        name: 'nameforsource2',
                        description: '',
                        template: ''
                    }
                ];
                await collection.insertMany(expectedsources);

                const sources = await service.getSources();

                expect(sources).toEqual(expectedsources);
            }
        );
    }
);

describe.skip(
    'getSourceById should',
    () => {
        let dbClient, collection, service;
        beforeAll(
            async () => {
                const deps = await createDependencies({DBNAME: 'test-sources-service-byid'});
                ({
                    dbClient,
                    sourcesCollection: collection,
                    sourcesService: service
                } = deps(['dbClient', 'sourcesCollection', 'sourcesService']));
            }
        );

        afterEach(
            async () => {
                await collection.deleteMany();
            }
        );

        afterAll(
            async () => {
                await dbClient.close();
            }
        );

        it(
            'return null when undefined source id',
            async () => {
                const sourceId = undefined;
                const source = await service.getSourceById(sourceId);
                expect(source).toEqual(null);
            }
        );

        it(
            'return Error when invalid source id',
            async () => {
                expect.assertions(1);
                const sourceId = 'invalidsourceid';
                try {
                    const source = await service.getSourceById(sourceId);
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return null when source not found',
            async () => {
                const sourceId = '123456789098';
                const source = await service.getSourceById(sourceId);
                expect(source).toEqual(null);
            }
        );

        it(
            'return null when database fails',
            async () => {
                expect.assertions(1);
                const sourceId = '123456789098';
                const service = buildSourcesService({});

                try {
                    await service.getSourceById(sourceId);
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return the source from the id',
            async () => {
                const expectedsource = {
                        name: 'nameforsource1',
                        description: '',
                        template: ''
                    };
                const { insertedId } = await collection.insertOne(expectedsource);

                const sources = await service.getSourceById(insertedId);

                expect(sources).toEqual({...expectedsource, _id: insertedId});
            }
        );
    }
);