from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.db.base_class import Base

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id = Column(String(36), nullable=False, index=True)
    actor_email = Column(String(255), nullable=False)
    action_type = Column(String(100), nullable=False, index=True)  # e.g., 'customer_suspended', 'api_key_revoked'
    target_type = Column(String(50), nullable=True)  # 'user', 'project', 'api_key', 'organization'
    target_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<AdminAuditLog {self.action_type} by {self.actor_email} at {self.created_at}>"
