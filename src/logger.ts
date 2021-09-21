export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  ACCESS,
  DROP
}

export default class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.WARN) {
    this.level = level
  }

  public info(message: any, ...additionalParams: any[]): void {
    this.log(LogLevel.INFO, message, ...additionalParams);
  }

  public debug(message: any, ...additionalParams: any[]): void {
    this.log(LogLevel.DEBUG, message, ...additionalParams);
  }

  public warn(message: any, ...additionalParams: any[]): void {
    this.log(LogLevel.WARN, message, ...additionalParams);
  }

  public error(message: any, ...additionalParams: any[]): void {
    this.log(LogLevel.ERROR, message, ...additionalParams);
  }

  public logMethodCall(ip: string, method: string): void {
    this.log(LogLevel.ACCESS, `${ip} ${method}`)
  }

  public logDrop(ip: string): void {
    this.log(LogLevel.DROP, ip)
  }

  private log(level: LogLevel, message: any, ...additionalParams: any[]): void {
    if (this.level <= level) {
      const messageString = this.formatMessage(level, message, additionalParams);
      console.log(messageString);
    }
  }

  private formatMessage(level: LogLevel, message: any, additionalParams: any[]): string {
    let messageString = '';
    if (message) {
      messageString += `[${new Date().toISOString()}] [${LogLevel[level]}] `;
      messageString += message;
    }
    if (additionalParams && additionalParams.length) {
      messageString += ` ${additionalParams.join(' ')}`;
    }
    return messageString;
  }
}