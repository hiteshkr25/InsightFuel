terraform {
  required_version = ">= 1.5.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23.0"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

resource "kubernetes_namespace" "insightfuel_ns" {
  metadata {
    name = var.namespace
    labels = {
      environment = var.environment
    }
  }
}

resource "kubernetes_limit_range" "insightfuel_limits" {
  metadata {
    name      = "insightfuel-limits"
    namespace = kubernetes_namespace.insightfuel_ns.metadata[0].name
  }
  spec {
    limit {
      type = "Container"
      default = {
        cpu    = "500m"
        memory = "512Mi"
      }
      default_request = {
        cpu    = "100m"
        memory = "256Mi"
      }
    }
  }
}
