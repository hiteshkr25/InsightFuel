import time
import logging
from typing import Callable, Any

logger = logging.getLogger("insightfuel.resilience")

class CircuitBreakerOpenException(Exception):
  pass

class CircuitBreaker:
  def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 30.0):
    self.failure_threshold = failure_threshold
    self.recovery_timeout = recovery_timeout
    self.state = "CLOSED" # CLOSED, OPEN, HALF-OPEN
    self.failure_count = 0
    self.last_state_change = time.time()

  def __call__(self, func: Callable, *args, **kwargs) -> Any:
    current_time = time.time()
    
    # 1. State check transitions
    if self.state == "OPEN":
      if current_time - self.last_state_change > self.recovery_timeout:
        self.state = "HALF-OPEN"
        self.last_state_change = current_time
        logger.info("Circuit transition to HALF-OPEN. Probing connection...")
      else:
        logger.warning("Circuit is OPEN. Fast failing request.")
        raise CircuitBreakerOpenException("Circuit is open. Inter-service link blocked.")
        
    try:
      result = func(*args, **kwargs)
      
      # 2. Handle successful executions
      if self.state == "HALF-OPEN":
        self.state = "CLOSED"
        self.failure_count = 0
        self.last_state_change = current_time
        logger.info("Circuit transition to CLOSED. Service recovered.")
      return result
      
    except Exception as e:
      self.failure_count += 1
      logger.error(f"Execution error caught: {e}. Failures count: {self.failure_count}")
      
      if self.state in ["CLOSED", "HALF-OPEN"] and self.failure_count >= self.failure_threshold:
        self.state = "OPEN"
        self.last_state_change = current_time
        logger.error("Circuit transition to OPEN. Failure threshold exceeded.")
        
      raise e
