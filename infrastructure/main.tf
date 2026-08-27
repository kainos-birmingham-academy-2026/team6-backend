terraform {
  required_version = ">= 1.15.8"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-team6-tfstate"
    storage_account_name = "sttfstateteam6"
    container_name       = "tfstate"
    # key is passed at `terraform init` time via -backend-config so it can vary per environment
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                       = "kvteam6dev"
  location                   = var.location
  resource_group_name        = module.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  rbac_authorization_enabled = true
  purge_protection_enabled   = false
}

resource "azurerm_user_assigned_identity" "container_apps" {
  name                = "id-team6-dev-container-apps"
  location            = var.location
  resource_group_name = module.resource_group.name
}

module "resource_group" {
  source   = "./modules/resource-group"
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    environment = var.environment
  }
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-team6-dev"
  location            = var.location
  resource_group_name = module.resource_group.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-team6-dev"
  location                   = var.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}
resource "azurerm_container_app" "backend" {
  name                         = "team6-backend-dev"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  registry {
    server   = "acraiacademy26.azurecr.io"
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  secret {
    name                = "jwt-secret-ref"
    key_vault_secret_id = "${azurerm_key_vault.main.vault_uri}secrets/jwt-secret"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  secret {
    name                = "database-url-ref"
    key_vault_secret_id = "${azurerm_key_vault.main.vault_uri}secrets/database-url"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  ingress {
    external_enabled = false
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "backend"
      image  = "acraiacademy26.azurecr.io/team6-backend:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret-ref"
      }

      env {
        name  = "FEATURE_APPLICATIONS_ENABLED"
        value = "true"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url-ref"
      }
    }
  }
}

resource "azurerm_container_app" "frontend" {
  name                         = "team6-frontend-dev"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  registry {
    server   = "acraiacademy26.azurecr.io"
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${azurerm_key_vault.main.vault_uri}secrets/session-secret"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  ingress {
    external_enabled = true
    target_port      = 3001
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "frontend"
      image  = "acraiacademy26.azurecr.io/team6-frontend:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name  = "API_BASE_URL"
        value = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
      }
    }
  }
}