variable "location" {
  description = "The azure region where resources will be created"
  type        = string
  default     = "uksouth"
}

variable "environment" {
  description = "the deployment enviroment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, or prod."
  }
}

variable "project_name" {
  description = "The short name of the project used for naming resources."
  type        = string
  default     = "team6"
}

# Passed as the commit SHA by CI so each deploy changes the container template and forces a new revision.
variable "backend_image_tag" {
  description = "Image tag for the backend container app."
  type        = string
  default     = "latest"
}

# Unique per CI run. Changing it forces a new revision, which makes the frontend re-pull its :latest image.
variable "deploy_id" {
  description = "Identifier for the deployment run, used as the container app revision suffix."
  type        = string
  default     = "init"
}

