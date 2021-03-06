import winston from 'winston';
import Sentry from '@sentry/node';

let log;

if (Meteor.isClient) {
  log = {
    log(msg) {
      Meteor.call('logToServerConsoleLog', msg);
    },
    debug(msg) {
      Meteor.call('logToServerConsoleDebug', msg);
    },
    info(msg) {
      Meteor.call('logToServerConsoleInfo', msg);
    },
    warn(msg) {
      Meteor.call('logToServerConsoleWarn', msg);
    },
    error(msg) {
      Meteor.call('logToServerConsoleError', msg);
    },
  };
}

if (Meteor.isServer) {
  const transports = [
    new winston.transports.Console({
      level: 'debug',
      prettyPrint: true,
      stderrLevels: ['error'],
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: true,
    }),
  ];

  const { sentry } = Meteor.settings;

  if (sentry && sentry.dsn) {
    Sentry.init({
      dsn: sentry.dsn,
    });
    /*
    const sentryTransport = new Sentry({
      level: sentry.level || 'error',
      dsn: sentry.dsn,
      patchGlobal: true,
      release: moment(new Date()).format('YYYY-MM-DD'),
    });
    transports.push(sentryTransport);
    */
  }

  log = new winston.Logger({ transports });
  log.sentry = Sentry;
}

function trySanitize(obj, secrets = ['password', 'passwordConfirm',
  'confirmPassword', 'secret', 'appSecret']) {
  if (Array.isArray(obj)) {
    return obj.map(x => trySanitize(x, secrets));
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((o, key) => {
      const value = o[key];
      if (typeof value === 'string' && secrets.includes(key)) {
        return {
          ...o,
          [key]: '*****',
        };
      }
      return {
        ...o,
        [key]: trySanitize(o[key]),
      };
    }, obj);
  }
  return obj;
}


export function sanitize(obj, secrets = ['password', 'passwordConfirm',
'confirmPassword', 'secret', 'appSecret']) {
  try {
    return trySanitize(obj, secrets);
  } catch (err) {
    return obj;
  }
}


export const logger = {
  log(...params) {
    log.log(...params.map(x => sanitize(x)));
  },

  debug(...params) {
    log.debug(...params.map(x => sanitize(x)));
  },

  info(...params) {
    log.info(...params.map(x => sanitize(x)));
  },

  warn(...params) {
    log.warn(...params.map(x => sanitize(x)));
  },

  error(...params) {
    log.error(...params.map(x => sanitize(x)));
  },
};
