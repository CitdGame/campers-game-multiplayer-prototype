/**
 * Error Handler - Centralized error handling and logging
 */
export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.maxLogSize = 1000;
  }

  /**
   * Log an error with context
   */
  logError(error, context = '', userId = null) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: error.message || error,
      stack: error.stack || '',
      context: context,
      userId: userId,
      id: this.generateId()
    };

    this.errors.push(errorEntry);
    this.trimLog();
    
    // Log to console
    console.error(`[${errorEntry.timestamp}] ERROR in ${context} (User: ${userId || 'unknown'}):`, error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    return errorEntry.id;
  }

  /**
   * Log a warning
   */
  logWarning(message, context = '', userId = null) {
    const warningEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      message: message,
      context: context,
      userId: userId,
      id: this.generateId()
    };

    this.warnings.push(warningEntry);
    this.trimLog();
    
    console.warn(`[${warningEntry.timestamp}] WARNING in ${context} (User: ${userId || 'unknown'}):`, message);
    
    return warningEntry.id;
  }

  /**
   * Log an info message
   */
  logInfo(message, context = '', userId = null) {
    const infoEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: message,
      context: context,
      userId: userId,
      id: this.generateId()
    };

    console.log(`[${infoEntry.timestamp}] INFO in ${context} (User: ${userId || 'unknown'}):`, message);
    
    return infoEntry.id;
  }

  /**
   * Handle socket error with user feedback
   */
  handleSocketError(socket, error, context = '') {
    const errorId = this.logError(error, context, socket.id);
    
    // Send user-friendly error message
    const userMessage = this.getUserFriendlyMessage(error);
    socket.emit('error', {
      message: userMessage,
      code: error.code || 'UNKNOWN_ERROR',
      id: errorId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error) {
    // Map common errors to user-friendly messages
    const errorMap = {
      'Not enough money': 'Du hast nicht genug Geld für diese Aktion.',
      'Tile already occupied': 'Dieses Feld ist bereits belegt.',
      'Player does not own this tile': 'Du besitzt dieses Feld nicht.',
      'Not your turn': 'Du bist nicht am Zug.',
      'Lobby nicht gefunden': 'Die Lobby wurde nicht gefunden.',
      'Spiel bereits gestartet': 'Das Spiel wurde bereits gestartet.',
      'NPC not found': 'Gast nicht gefunden.',
      'Asset cannot be upgraded': 'Dieses Asset kann nicht upgegradet werden.',
      'Invalid asset type': 'Unbekannter Asset-Typ.',
      'Unknown NPC type': 'Unbekannter Gasttyp.',
      'No valid asset on this tile': 'Auf diesem Feld befindet sich kein gültiges Asset.',
      'NPC already placed': 'Dieser Gast ist bereits platziert.',
      'Source tile has no asset': 'Das Quellfeld hat kein Asset.',
      'Target tile already occupied': 'Das Zielfeld ist bereits belegt.',
      'No asset to delete': 'Kein Asset zum Löschen gefunden.',
      'No unplatzierten Gäste': 'Keine unplatzierten Gäste verfügbar.',
      'No compatible guests available': 'Keine kompatiblen Gäste verfügbar.',
      'Not enough space in asset': 'Nicht genügend Platz im Asset.',
      'NPC group too large for asset capacity': 'Die Gruppe ist zu groß für dieses Asset.',
      'Hippies cannot stay in': 'Hippies können nicht in diesem Asset übernachten.',
      'Familie cannot stay in': 'Familien können nicht in diesem Asset übernachten.',
      'Snob cannot stay in': 'Snobs können nicht in diesem Asset übernachten.',
      'No coins available': 'Keine Münzen verfügbar.',
      'Not enough money for promotion': 'Nicht genug Geld für diese Promotion.',
      'Unknown promotion type': 'Unbekannter Promotion-Typ.'
    };

    return errorMap[error.message] || error.message || 'Ein unerwarteter Fehler ist aufgetreten.';
  }

  /**
   * Create a game-specific error
   */
  createGameError(message, code = 'GAME_ERROR', details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    error.isGameError = true;
    return error;
  }

  /**
   * Create a validation error
   */
  createValidationError(message, field = null, value = null) {
    const error = new Error(message);
    error.code = 'VALIDATION_ERROR';
    error.field = field;
    error.value = value;
    error.isValidationError = true;
    return error;
  }

  /**
   * Create a network error
   */
  createNetworkError(message, statusCode = 500) {
    const error = new Error(message);
    error.code = 'NETWORK_ERROR';
    error.statusCode = statusCode;
    error.isNetworkError = true;
    return error;
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsync(fn, context = '') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logError(error, context);
        throw error;
      }
    };
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentErrors = this.errors.filter(e => new Date(e.timestamp) > oneHourAgo);
    const dailyErrors = this.errors.filter(e => new Date(e.timestamp) > oneDayAgo);

    const errorsByContext = {};
    const errorsByUser = {};

    for (const error of recentErrors) {
      errorsByContext[error.context] = (errorsByContext[error.context] || 0) + 1;
      if (error.userId) {
        errorsByUser[error.userId] = (errorsByUser[error.userId] || 0) + 1;
      }
    }

    return {
      totalErrors: this.errors.length,
      recentErrors: recentErrors.length,
      dailyErrors: dailyErrors.length,
      totalWarnings: this.warnings.length,
      errorsByContext,
      errorsByUser,
      lastError: this.errors[this.errors.length - 1] || null
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50) {
    return this.errors.slice(-limit).reverse();
  }

  /**
   * Get recent warnings
   */
  getRecentWarnings(limit = 50) {
    return this.warnings.slice(-limit).reverse();
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.errors = [];
    this.warnings = [];
    this.logInfo('Logs cleared', 'system');
  }

  /**
   * Export logs to JSON
   */
  exportLogs() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      exportedAt: new Date().toISOString(),
      stats: this.getErrorStats()
    };
  }

  /**
   * Trim log to prevent memory issues
   */
  trimLog() {
    if (this.errors.length > this.maxLogSize) {
      this.errors = this.errors.slice(-this.maxLogSize);
    }
    if (this.warnings.length > this.maxLogSize) {
      this.warnings = this.warnings.slice(-this.maxLogSize);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Check if error is critical
   */
  isCriticalError(error) {
    const criticalCodes = [
      'DATABASE_ERROR',
      'SYSTEM_ERROR',
      'MEMORY_ERROR',
      'NETWORK_ERROR'
    ];
    
    return criticalCodes.includes(error.code) || 
           error.message.includes('ECONNRESET') ||
           error.message.includes('ENOTFOUND') ||
           error.message.includes('ECONNREFUSED');
  }

  /**
   * Handle critical errors
   */
  handleCriticalError(error, context = '') {
    this.logError(error, context);
    
    if (this.isCriticalError(error)) {
      console.error('CRITICAL ERROR DETECTED:', error);
      // In a production environment, you might want to:
      // - Send alerts to monitoring systems
      // - Initiate graceful shutdown
      // - Notify administrators
    }
  }

  /**
   * Create error response for client
   */
  createErrorResponse(error, includeStack = false) {
    const response = {
      success: false,
      error: {
        message: this.getUserFriendlyMessage(error),
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      }
    };

    if (includeStack && error.stack) {
      response.error.stack = error.stack;
    }

    if (error.details) {
      response.error.details = error.details;
    }

    return response;
  }

  /**
   * Validate error object
   */
  isValidError(error) {
    return error instanceof Error || 
           (typeof error === 'object' && error.message);
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Global error handlers
process.on('uncaughtException', (error) => {
  errorHandler.handleCriticalError(error, 'uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  errorHandler.handleCriticalError(error, 'unhandledRejection');
});

// Export convenience functions
export const logError = (error, context, userId) => errorHandler.logError(error, context, userId);
export const logWarning = (message, context, userId) => errorHandler.logWarning(message, context, userId);
export const logInfo = (message, context, userId) => errorHandler.logInfo(message, context, userId);
export const handleSocketError = (socket, error, context) => errorHandler.handleSocketError(socket, error, context);
