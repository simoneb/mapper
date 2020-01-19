import { createDependencies } from '../src/dependencies';
import {
    buildResponsesService
} from '../src/services/responses';
import { typeOf } from '../src/utils/error-encoder';
import {
    ERROR_DATABASE,
    ERROR_RESPONSE_FORMAT
} from '../src/errors';

describe(
    'getresponses should',
    () => {
        let dbClient, collection, service;
        beforeAll(
            async () => {
                const deps = await createDependencies({DBNAME: 'test-responses-service-all'});
                ({
                    dbClient,
                    responsesCollection: collection,
                    responsesService: service
                } = deps(['dbClient', 'responsesCollection', 'responsesService']));
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
            'return an empty array when no responses',
            async () => {
                const responses = await service.getResponses();
                expect(responses).toEqual([]);
            }
        );

        it(
            'return an Error array when database fails',
            async () => {
                expect.assertions(1);
                const service = buildResponsesService({});

                try {
                    await service.getResponses();
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return an array with all responses',
            async () => {
                const expectedresponses = [
                    {
                        name: 'nameforresponse1',
                        description: '',
                        template: ''
                    },
                    {
                        name: 'nameforresponse2',
                        description: '',
                        template: ''
                    }
                ];
                await collection.insertMany(expectedresponses);

                const responses = await service.getResponses();

                expect(responses).toEqual(expectedresponses);
            }
        );
    }
);

describe(
    'getResponseById should',
    () => {
        let dbClient, collection, service;
        beforeAll(
            async () => {
                const deps = await createDependencies({DBNAME: 'test-responses-service-byid'});
                ({
                    dbClient,
                    responsesCollection: collection,
                    responsesService: service
                } = deps(['dbClient', 'responsesCollection', 'responsesService']));
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
            'return null when undefined response id',
            async () => {
                const responseId = undefined;
                const response = await service.getResponseById(responseId);
                expect(response).toEqual(null);
            }
        );

        it(
            'return Error when invalid response id',
            async () => {
                expect.assertions(1);
                const responseId = 'invalidresponseid';
                try {
                    const response = await service.getResponseById(responseId);
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return null when response not found',
            async () => {
                const responseId = '123456789098';
                const response = await service.getResponseById(responseId);
                expect(response).toEqual(null);
            }
        );

        it(
            'return null when database fails',
            async () => {
                expect.assertions(1);
                const responseId = '123456789098';
                const service = buildResponsesService({});

                try {
                    await service.getResponseById(responseId);
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return the response from the id',
            async () => {
                const expectedresponse = {
                        name: 'nameforresponse1',
                        description: '',
                        template: ''
                    };
                const { insertedId } = await collection.insertOne(expectedresponse);

                const responses = await service.getResponseById(insertedId);

                expect(responses).toEqual({...expectedresponse, _id: insertedId});
            }
        );
    }
);

describe(
    'insertResponse should',
    () => {
        let dbClient, collection, service;
        beforeAll(
            async () => {
                const deps = await createDependencies({DBNAME: 'test-responses-service-insert'});
                ({
                    dbClient,
                    responsesCollection: collection,
                    responsesService: service
                } = deps(['dbClient', 'responsesCollection', 'responsesService']));
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
            'return an ERROR_DATABASE when database fails',
            async () => {
                expect.assertions(1);
                const service = buildResponsesService({});

                try {
                    await service.insertResponse({});
                }
                catch (error) {
                    expect(typeOf(error, ERROR_DATABASE.type)).toBe(true);
                }
            }
        );

        it(
            'return an ERROR_RESPONSE_FORMAT when response is null',
            async () => {
                expect.assertions(1);

                try {
                    await service.insertResponse(null);
                }
                catch (error) {
                    expect(typeOf(error, ERROR_RESPONSE_FORMAT.type)).toBe(true);
                }
            }
        );

        it(
            'return an ERROR_RESPONSE_FORMAT when response is undefined',
            async () => {
                expect.assertions(1);

                try {
                    await service.insertResponse();
                }
                catch (error) {
                    expect(typeOf(error, ERROR_RESPONSE_FORMAT.type)).toBe(true);
                }
            }
        );

        it(
            'return the object inserted in database',
            async () => {
                const responseObject = {
                    name: 'CEP-Notifier-target',
                    description: 'Transform CEP body in Notifier Body',
                    status: '200',
                    headers: '{"content-type": "text/html", "appid": "3beca"',
                    template: 'free text response'
                };

                const responseInserted = await service.insertResponse(responseObject);

                expect(responseInserted).toEqual({
                    _id: expect.anything(),
                    name: responseInserted.name,
                    description: responseInserted.description,
                    status: responseInserted.status,
                    headers: responseInserted.headers,
                    template: responseInserted.template
                });
            }
        );
    }
);
