# 🕴️ Ministry-of-Groove

**Ministry-of-Groove** is a secure, Progressive Web App (PWA) designed for centralized operation management and media distribution. 

## 📂 Repository Structure
The project is organized to separate core logic, public assets, and restricted command pages:

* **/assets** - Contains all UI images and encrypted media (.mp4, .m4a).
* **/css** - Core styling and visual themes.
* **/js** - Logic, Service Workers, and Authentication scripts.
* **/pages** - Restricted HTML modules including the Directorate and Dispatch archives.
* **index.html** - The Operative Dashboard.
* **login.html** - The Central Access Gate.

## 🔐 Security Protocol
The application implements a dual-layered access gate:

1.  **Direct Entrance:** All users must pass through `login.html`.
2.  **Role-Based Access Control (RBAC):**
    * **Director:** Full access to the Directorate and command modules.
    * **Operative:** Standard access to the main dashboard.
3.  **Session Management:** Sessions are handled via `auth.js` and can be terminated using the "Terminate Session" command, which clears local authorization data.

## 🚀 Deployment
This app is optimized for static hosting (GitHub Pages/Vercel) and includes PWA support for offline access via the `service-worker.js`.

---
*Property of the Ministry. Unauthorized access is strictly monitored.*

