import time
import uuid
import logging
import contextvars
from typing import Callable
from fastapi import FastAPI, Request, Response
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

request_id_var = contextvars.ContextVar("request_id", default="-")
correlation_id_var = contextvars.ContextVar("correlation_id", default="-")

class CorrelationFilter(logging.Filter):
  def filter(self, record):
    record.request_id = request_id_var.get()
    record.correlation_id = correlation_id_var.get()
    return True

# Metrics for feature intelligence computations
REGISTRY_SIZE = Gauge(
  "feature_registry_total", 
  "Total number of registered selector features", 
  ["project_id"]
)
INTEL_COMPUTE_DURATION = Histogram(
  "feature_intelligence_computation_seconds", 
  "Duration of feature adoption, growth, and stickiness calculations"
)

HTTP_REQUEST_COUNT = Counter(
  "http_requests_total", 
  "Total HTTP Requests", 
  ["method", "endpoint", "http_status"]
)
HTTP_REQUEST_LATENCY = Histogram(
  "http_request_duration_seconds", 
  "HTTP Request Duration", 
  ["method", "endpoint"]
)

logger = logging.getLogger("insightfuel.feature-intelligence")

def setup_telemetry(app: FastAPI) -> None:
  # Structured Logs formatters
  handler = logging.StreamHandler()
  formatter = logging.Formatter(
    '{"timestamp": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", '
    '"request_id": "%(request_id)s", "correlation_id": "%(correlation_id)s", "message": "%(message)s"}'
  )
  handler.setFormatter(formatter)
  handler.addFilter(CorrelationFilter())
  
  root_logger = logging.getLogger("insightfuel.feature-intelligence")
  root_logger.setLevel(logging.INFO)
  root_logger.handlers = [handler]

  # Tracer config
  provider = TracerProvider()
  processor = SimpleSpanProcessor(ConsoleSpanExporter())
  provider.add_span_processor(processor)
  trace.set_tracer_provider(provider)
  FastAPIInstrumentor.instrument_app(app)

  @app.middleware("http")
  async def tracking_middleware(request: Request, call_next: Callable) -> Response:
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    corr_id = request.headers.get("X-Correlation-ID", req_id)
    
    req_token = request_id_var.set(req_id)
    corr_token = correlation_id_var.set(corr_id)
    
    start_time = time.time()
    method = request.method
    endpoint = request.url.path
    
    try:
      response = await call_next(request)
      duration = time.time() - start_time
      
      HTTP_REQUEST_COUNT.labels(method=method, endpoint=endpoint, http_status=str(response.status_code)).inc()
      HTTP_REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
      
      response.headers["X-Request-ID"] = req_id
      response.headers["X-Correlation-ID"] = corr_id
      return response
    finally:
      request_id_var.reset(req_token)
      correlation_id_var.reset(corr_token)
