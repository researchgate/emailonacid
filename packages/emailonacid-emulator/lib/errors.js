'use strict';

class ApiError extends Error {
  constructor(name, message) {
    super();
    this.name = name;
    this.message = message;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
      },
    };
  }
}

class AccessDeniedError extends ApiError {
  constructor() {
    super('AccessDenied', 'Invalid API key or password');
  }
}

class NotFoundError extends ApiError {
  constructor() {
    super('NotFoundError', 'Could not find the requested resource');
  }
}

class NotImplementedError extends ApiError {
  constructor() {
    super(
      'NotImplemented',
      'Requested endpoint is not yet available in emulator'
    );
  }
}

class NoContentError extends ApiError {
  constructor() {
    super(
      'NoContent',
      'You have not submitted content with a POST or PUT request'
    );
  }
}

class InvalidJsonError extends ApiError {
  constructor() {
    super('InvalidJSON', 'Your JSON is invalid');
  }
}

class InvalidClientError extends ApiError {
  constructor(clients) {
    super(
      'InvalidClient',
      [
        'A client ID you have requested',
        `${clients.join(', ')}`,
        'could not be found.',
        'It may be that the code does not exist or that it is no longer supported.',
      ].join(' ')
    );
  }
}

class InvalidTestIdError extends ApiError {
  constructor() {
    super('InvalidTestID', 'Test ID not found');
  }
}

class NoSubjectError extends ApiError {
  constructor() {
    super('NoSubjectError', 'You must provide a subject');
  }
}

class NoSourceError extends ApiError {
  constructor() {
    super('NoSource', 'You must provide either an HTML or a URL source');
  }
}

module.exports = {
  AccessDeniedError,
  NotFoundError,
  NotImplementedError,
  NoContentError,
  InvalidJsonError,
  InvalidClientError,
  InvalidTestIdError,
  NoSubjectError,
  NoSourceError,
};
