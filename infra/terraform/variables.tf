variable "kubeconfig_path" {
  type        = string
  description = "Path to active Kubeconfig authentication file."
  default     = "~/.kube/config"
}

variable "namespace" {
  type        = string
  description = "Target deployment namespace."
  default     = "insightfuel"
}

variable "environment" {
  type        = string
  description = "Environment identifier (e.g. production, staging)."
  default     = "production"
}
