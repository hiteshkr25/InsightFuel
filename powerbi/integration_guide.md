# Enterprise Power BI Integration Guide

This guide outlines the setups required to configure **Power BI Embedded** securely inside InsightFuel.

---

## 1. Microsoft Entra ID (Azure AD) Configuration

To authenticate via Service Principal OAuth2, configure the following parameters:

1.  **Register an Application:**
    *   Navigate to **Azure Portal** → **App Registrations** → **New Registration**.
    *   Name the application (e.g., `InsightFuel-PowerBI-Embedded`).
2.  **Generate Client Secret:**
    *   Select **Certificates & Secrets** → **New Client Secret**.
    *   Store the generated secret value securely (e.g., in Azure Key Vault or backend `.env`).
3.  **API Permissions:**
    *   Grant the application access to **Power BI Service** permissions (`Report.Read.All`, `Workspace.Read.All`).
4.  **Create an Entra Security Group:**
    *   Create a Security Group in Azure AD and add the registered Service Principal as a member.

---

## 2. Power BI Admin Portal Setup

Configure these settings inside the **Power BI Admin Portal** to allow Service Principal access:

1.  **Tenant Settings:**
    *   Enable **"Allow service principals to use Power BI APIs"**.
    *   Restrict access to the created Security Group containing the Service Principal.
2.  **Workspace Access Control:**
    *   Assign the Service Principal application permissions as **Admin** or **Member** on target Power BI workspaces.
3.  **Capacity Settings:**
    *   Assign target workspaces to an active **A-sku** or **EM-sku** capacity for dedicated embedding power.

---

## 3. Row Level Security (RLS) Configuration

To restrict users to their active tenant scopes:

1.  Define a role named `Viewer` inside Power BI Desktop (e.g., checking `[OrganizationID] = USERNAME()`).
2.  During backend Embed Token requests, populate the effective identities payload:
    ```json
    {
      "identities": [
        {
          "username": "org_123:proj_123",
          "roles": ["Viewer"],
          "datasets": ["ds_rev_01"]
        }
      ]
    }
    ```
    This automatically isolates dashboard charts based on active frontend state filters.
