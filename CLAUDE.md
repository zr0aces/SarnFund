  # 🧠 CLAUDE.md - Project Development Workflow & Architecture Guide

  This document serves as the primary developer resource for understanding the overarching architecture, common development workflows, and best practices
  across the connected services.

  ---

  ## 🧭 Project Overview & Service Map

  The system is composed of several distinct, yet interconnected services, each handling specialized domains.

  | Service | Primary Stack/Focus | Key Responsibilities | Primary Interaction Points |
  | :--- | :--- | :--- | :--- |
  | **HausClient/Web** | React, TypeScript | Frontend UI/UX layer. Consumes APIs via client SDK/REST. | All backend services (API Gateway). |
  | **API Gateway** | (Implied/REST) | Central routing, rate limiting, authentication enforcement. | Houses endpoints for Auth, Data, and Business Logic. |
  | **Auth Service** | (Implied Backend) | User registration, login, token issuance (JWT). | Required by all services before data access. |
  | **Core Business Logic** | PHP/Laravel/Symfony | Contains core transactional logic for business domains. | Interacts heavily with dedicated data services.
   |
  | **HausDataService** | (Implied Backend) | Primary API layer for reading/writing structured data. | Called by the Business Logic layer. |
  | **S3 Storage/Media** | AWS S3 | Centralized storage for non-structured assets (images, documents). | Accessed via SDK/Signed URLs. |

  ---

  ## 🚀 Development Workflows

  ### 1. Standard Feature Implementation (New Feature)

  1.  **Requirement Definition:** Update Jira ticket/PR description detailing required inputs, desired outputs, and affected services.
  2.  **API Contract First:** If the feature requires a new data endpoint, **update the API Gateway/Data Service contract first**. Define the required
  payload and expected response structure (use OpenAPI/Swagger definitions).
  3.  **Backend Implementation:** Implement the core logic in the relevant service (e.g., Business Logic). Focus on business validation and data integrity.
  4.  **Data Layer Interaction:** Write/modify data access layer calls to use the `HausDataService` or relevant database ORM.
  5.  **Frontend Integration:** Update the `HausClient/Web` component to consume the new endpoint, ensuring proper state management and error handling
  (displaying API/Business errors gracefully).
  6.  **Testing:** Write comprehensive unit tests (backend) and integration/e2e tests (frontend).
  7.  **Deployment:** Follow the standard CI/CD pipeline flow.

  ### 2. Data Model Changes (Schema Migration)

  1.  **Impact Assessment:** Identify *every* service that reads or writes to the affected table/model.
  2.  **Migration Script:** Create a version-controlled, idempotent migration script (e.g., using Laravel Migrator).
  3.  **Backend Update:** Update the models/services in *all* affected services to handle the new/changed schema structure *before* the migration runs
  (read/write compatibility).
  4.  **Deployment:** Deploy services sequentially: (1) Update Code -> (2) Run Migrations -> (3) Final Health Check.

  ### 3. Third-Party Integration (e.g., Payment Gateway)

  1.  **Sandbox Setup:** Configure and test connectivity against the provider's sandbox environment.
  2.  **Abstraction Layer:** **Crucial:** Do not embed provider-specific logic directly into the core service. Create an **Adapter Pattern** wrapper layer
  (e.g., `PaymentGatewayAdapter`).
  3.  **Error Mapping:** Map all provider-specific error codes/messages to standardized, internal application error codes for the client.
  4.  **Network:** Handle secure credential storage (Vault/Secrets Manager) for API keys.

  ---

  ## 🛠️ Technical Guidelines & Best Practices

  ### 💾 Data Handling
  *   **Principle of Least Privilege:** Services should only have read/write access to the data they strictly require.
  *   **API Gateway Role:** Treat the Gateway as the single source of truth for *endpoint availability*, but the Business Logic services remain the source of
   truth for *business rules*.
  *   **Caching:** Utilize Redis/Memcached for session data and frequently accessed, non-critical read-only reference data. Cache keys must be aggressively
  invalidated upon data write.

  ### 🔐 Security
  *   **Authentication:** Always use JWTs passed via the `Authorization` header. Validate the token's signature, expiry, and issuer on *every* request
  hitting the API Gateway.
  *   **Input Validation:** All user inputs must be validated (type, length, format) *at the entry point* (Gateway or Service Layer) and **never trusted**.
  *   **Secrets:** **Never** hardcode credentials. Use environment variables or dedicated secret management tools.

  ### 🎨 Frontend Development (HausClient/Web)
  *   **State Management:** Use a centralized store (e.g., Redux/Zustand) for global state. Local component state should be minimal.
  *   **API Calls:** Wrap all network calls using a custom hook/service to handle loading, error, and success states consistently across the application.
  *   **Code Structure:** Adhere strictly to component/hook separation. Keep presentation logic out of business logic components.

  ---

  ## ☁️ Infrastructure & Deployment (DevOps Focus)

  *   **Containerization:** All services must be containerized using Docker.
  *   **Orchestration:** Deployment is managed via Kubernetes (K8s). Understand namespace management for isolating environments (Dev -> Staging -> Prod).
  *   **Logging:** All services must emit structured logs (JSON format) containing at least: `timestamp`, `service_name`, `level`, `trace_id`, and a detailed
   `message`.
  *   **Tracing:** Implement distributed tracing (e.g., using Jaeger/OpenTelemetry) by propagating a unique `trace_id` across all inter-service calls to
  debug latency issues.

  ---
  *Last Updated: [Current Date/Date of Completion]*
