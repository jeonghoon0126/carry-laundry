/**
 * 프로덕션 로깅 시스템
 * 에러, 성능, 사용자 행동 등을 추적합니다.
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  private log(level: LogEntry['level'], message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const formattedLog = this.formatLog(entry);

    if (this.isDevelopment) {
      // 개발 환경에서는 콘솔에 출력
      console[level === 'debug' ? 'log' : level](formattedLog);
    } else {
      // 프로덕션에서는 서버 로그에 출력
      console[level === 'debug' ? 'log' : level](formattedLog);
      
      // TODO: 실제 프로덕션에서는 외부 로깅 서비스로 전송
      // 예: Sentry, LogRocket, DataDog 등
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  // 결제 관련 특별 로깅 메서드들
  paymentStarted(orderId: string, amount: number, context?: Record<string, any>) {
    this.info('Payment started', {
      orderId,
      amount,
      event: 'payment_started',
      ...context,
    });
  }

  paymentCompleted(orderId: string, amount: number, paymentId: string, context?: Record<string, any>) {
    this.info('Payment completed', {
      orderId,
      amount,
      paymentId,
      event: 'payment_completed',
      ...context,
    });
  }

  paymentFailed(orderId: string, reason: string, context?: Record<string, any>) {
    this.error('Payment failed', {
      orderId,
      reason,
      event: 'payment_failed',
      ...context,
    });
  }

  orderCreated(orderId: string, context?: Record<string, any>) {
    this.info('Order created', {
      orderId,
      event: 'order_created',
      ...context,
    });
  }

  apiError(endpoint: string, error: any, context?: Record<string, any>) {
    this.error('API error', {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      event: 'api_error',
      ...context,
    });
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 편의 함수들
export const logPaymentStart = (orderId: string, amount: number, context?: Record<string, any>) => {
  logger.paymentStarted(orderId, amount, context);
};

export const logPaymentComplete = (orderId: string, amount: number, paymentId: string, context?: Record<string, any>) => {
  logger.paymentCompleted(orderId, amount, paymentId, context);
};

export const logPaymentFailure = (orderId: string, reason: string, context?: Record<string, any>) => {
  logger.paymentFailed(orderId, reason, context);
};

export const logOrderCreated = (orderId: string, context?: Record<string, any>) => {
  logger.orderCreated(orderId, context);
};

export const logApiError = (endpoint: string, error: any, context?: Record<string, any>) => {
  logger.apiError(endpoint, error, context);
};

export default logger;
