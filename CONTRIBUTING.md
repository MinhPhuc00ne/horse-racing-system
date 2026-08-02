# Contributing Guidelines

Thank you for your interest in contributing to the **Horse Racing Management System**! To ensure a professional, consistent, and easy-to-manage development process, please adhere to the branch naming rules, commit message standards, and workflow outlined below.

---

## 📋 Table of Contents

1. [Branch Naming Rules](#1-branch-naming-rules)
2. [Commit Message Convention (Conventional Commits)](#2-commit-message-convention-conventional-commits)
3. [Development Workflow & Pull Request (PR)](#3-development-workflow--pull-request-pr)
4. [Code Standards & Best Practices](#4-code-standards--best-practices)

---

## 1. 🌿 Branch Naming Rules

Branch names should accurately reflect the work being performed. Use lowercase letters and separate words with hyphens (`-`).

### Branch Name Structure:
```text
<prefix>/<feature-name-or-task-id>
```

### Valid Prefixes:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feature/` | New feature development | `feature/jwt-authentication`, `feature/payos-payment` |
| `fix/` | Standard bug fixes | `fix/login-validation-error`, `fix/wallet-balance-calc` |
| `hotfix/` | Urgent fixes for production environment | `hotfix/security-patch-cors` |
| `docs/` | Documentation updates (README, API docs, Swagger...) | `docs/update-contributing-guide` |
| `refactor/` | Code optimization without changing functionality | `refactor/race-service-logic` |
| `test/` | Adding or updating unit tests, integration tests | `test/auth-controller-test` |
| `chore/` | Updating configuration, dependencies, docker compose | `chore/update-pom-dependencies` |

---

## 2. 📝 Commit Message Convention (Conventional Commits)

The project adheres to the **Conventional Commits** specification to keep commit history clean, automate release notes, and support CI/CD pipelines.

### Commit Message Structure:
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Standard Types:

- **`feat`**: A new feature for the user or system.
- **`fix`**: A bug fix.
- **`docs`**: Documentation changes only.
- **`style`**: Code formatting changes (whitespace, missing semi-colons...) with no logic changes.
- **`refactor`**: Refactoring code without fixing bugs or adding features.
- **`perf`**: Code changes that improve performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`chore`**: Build process or auxiliary tool changes (build system, dependencies, tool setup).
- **`ci`**: CI/CD configuration changes (GitHub Actions, Docker setup...).

### Scope Examples:
Scope can be the name of the relevant module or component, such as: `auth`, `race`, `wallet`, `payment`, `ui`, `docker`, `db`.

### Valid Commit Examples:

```bash
# Add Google OAuth2 login integration
feat(auth): add Google OAuth2 login integration

# Fix wallet balance calculation after placing a bet
fix(wallet): resolve race condition in balance deduction

# Update Contributing Guidelines
docs(readme): add contributing guidelines and commit specs

# Re-structure race processing service
refactor(race): simplify RaceScheduleService method calls

# Add unit tests for PaymentController
test(payment): add unit tests for PayOS webhook handling
```

---

## 3. 🔄 Development Workflow & Pull Request (PR)

1. **Fork / Checkout a new branch** from `main` (or `develop`):
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/user-profile-avatar
   ```
2. **Make changes and commit** adhering to the Conventional Commits specification.
3. **Inspect code & Test** before pushing:
   - Ensure the application compiles without errors.
   - Run code linter/formatter.
4. **Push branch to GitHub**:
   ```bash
   git push origin feature/user-profile-avatar
   ```
5. **Create a Pull Request (PR)**:
   - Provide a clear PR title following the commit format: `feat(user): add user profile avatar upload`.
   - Describe in detail what was changed and how to test it.
   - Tag reviewers (team members or Maintainers).

---

## 4. 🛠️ Code Standards & Best Practices

- **Backend (Spring Boot)**:
  - Follow Java Naming Conventions (CamelCase for variables/methods, PascalCase for classes).
  - Do not hardcode sensitive information (API Keys, Passwords, Secrets) in the source code. Use `.env` files or `application.yml`.
  - Write code with proper Exception Handling (using `@RestControllerAdvice` when appropriate).
- **Frontend (React + Vite)**:
  - Name components using PascalCase (e.g., `RaceCard.jsx`).
  - Keep components modular and reusable, leveraging custom Hooks and Service modules (Axios).
  - Follow ESLint and Prettier configurations set up in the project (`npm run lint`).
