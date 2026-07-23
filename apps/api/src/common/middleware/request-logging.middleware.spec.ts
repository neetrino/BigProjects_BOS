import { Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import type { NextFunction, Request, Response } from 'express';
import { RequestLoggingMiddleware } from './request-logging.middleware';

type MockResponse = EventEmitter & {
  statusCode: number;
  setHeader: jest.Mock;
};

const buildResponse = (statusCode = 200): MockResponse => {
  const res = new EventEmitter() as MockResponse;
  res.statusCode = statusCode;
  res.setHeader = jest.fn();
  return res;
};

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;
  let logSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reuses x-request-id and logs on finish at log level', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/v1/cycles',
      url: '/api/v1/cycles',
      headers: { 'x-request-id': 'test-rid-123' },
    } as unknown as Request;
    const res = buildResponse(200);
    const next = jest.fn() as NextFunction;

    middleware.use(req, res as unknown as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'test-rid-123');
    expect(next).toHaveBeenCalled();

    res.emit('finish');

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/api\/v1\/cycles 200 \d+ms rid=test-rid-123$/),
    );
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('generates a request id when the header is absent', () => {
    const req = {
      method: 'POST',
      originalUrl: '/api/v1/organizations',
      url: '/api/v1/organizations',
      headers: {},
    } as unknown as Request;
    const res = buildResponse(201);
    const next = jest.fn() as NextFunction;

    middleware.use(req, res as unknown as Response, next);

    const setHeaderCall = res.setHeader.mock.calls.find(
      (call: [string, string]) => call[0] === 'x-request-id',
    );
    expect(setHeaderCall).toBeDefined();
    const generatedId = setHeaderCall?.[1] as string;
    expect(generatedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    res.emit('finish');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`rid=${generatedId}`));
  });

  it('logs /api/v1/health at debug level', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/v1/health',
      url: '/api/v1/health',
      headers: { 'x-request-id': 'health-rid' },
    } as unknown as Request;
    const res = buildResponse(200);
    const next = jest.fn() as NextFunction;

    middleware.use(req, res as unknown as Response, next);
    res.emit('finish');

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/api\/v1\/health 200 \d+ms rid=health-rid$/),
    );
    expect(logSpy).not.toHaveBeenCalled();
  });
});
