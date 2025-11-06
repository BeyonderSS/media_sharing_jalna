import chalk from 'chalk';
import moment from 'moment-timezone';

const getTimestamp = () => {
  return moment().tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm:ss A z');
};

const log = (level, message, context = '') => {
  const timestamp = getTimestamp();
  const contextString = context ? ` [${context}]` : '';
  console.log(`[${timestamp}] ${level}${contextString}: ${message}`);
};

const logger = {
  info: (message, context) => { log(chalk.blue('INFO'), message, context); },
  warn: (message, context) => { log(chalk.yellow('WARN'), message, context); },
  error: (message, context, error) => {
    const errorMessage = error instanceof Error ? error.stack || error.message : String(error || 'Unknown error');
    log(chalk.red('ERROR'), `${message} - ${errorMessage}`, context);
  },
  debug: (message, context) => {
    if (process.env.NODE_ENV === 'development') {
      log(chalk.green('DEBUG'), message, context);
    }
  },
};

export default logger;
